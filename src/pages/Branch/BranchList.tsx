import { useEffect, useState } from 'react'
import {Search, Building2, Download, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { useSelector, useDispatch } from 'react-redux'
import { selectBranchListData } from '../../redux/branch/branch.selector'
import {
  bulkUploadBranchesResponseResetStart,
  bulkUploadBranchesStart,
  getBranchListStart,
} from '../../redux/branch/branch.action'

// Branch type definition
interface Branch {
  AreaID: number
  AreaName: string
  uniqueAreaID: string
  AreaDistrict: string
  AreaState: string
  AreaCountry?: string
  GroupCount?: number
  CenterCount?: number
  MemberCount?: number
  isSubBranch?: boolean
  [key: string]: any
}


function BranchList() {
  const dispatch = useDispatch()
  const branchListData = useSelector(selectBranchListData)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [sortColumn, setSortColumn] = useState<keyof Branch>('AreaName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const bulkUploadResponse = useSelector((state: any) => state.branch.bulkUploadBranchesResponse)

  useEffect(() => {
    loadBranchList()
  }, [currentPage])

  useEffect(() => {
    if (uploading && bulkUploadResponse) {
      setUploading(false)
      setUploadModalOpen(false)
      setSelectedFile(null)
      if (bulkUploadResponse.statusCode === '01') {
        toast.success('Bulk upload completed successfully')
        loadBranchList()
      } else {
        toast.error('Bulk upload failed')
      }
      dispatch(bulkUploadBranchesResponseResetStart())
    }
  }, [bulkUploadResponse, dispatch, uploading])

  const loadBranchList = () => {
    setLoading(true)
    const data = {
      companyID: 1,
      databaseName: 'General',
      userID: 1,
      userAccessBranchID: 0,
      userName: 'Admin',
      inputSearch: searchTerm,
      limit: 20,
    }
    dispatch(getBranchListStart(data))
  }

  useEffect(() => {
    if (loading && branchListData) {
      setLoading(false)
    }
  }, [branchListData, loading])

  const handleSort = (column: keyof Branch) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedBranches = [...branchListData].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  const filteredBranches = sortedBranches.filter((branch: Branch) =>
    branch.AreaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.uniqueAreaID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.AreaDistrict.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.AreaState.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearch = () => {
    setCurrentPage(0)
    loadBranchList()
  }

  const handleExport = (format: 'excel' | 'csv') => {
    const dataToExport = filteredBranches.map(branch => ({
      'Branch Code': branch.uniqueAreaID,
      'Branch Name': branch.AreaName,
      'District': branch.AreaDistrict,
      'State': branch.AreaState,
      'Country': branch.AreaCountry,
      'Groups': branch.GroupCount,
      'Centers': branch.CenterCount,
      'Members': branch.MemberCount,
      'Type': branch.isSubBranch ? 'Sub Branch' : 'Main Branch',
    }))

    if (format === 'csv') {
      const headers = Object.keys(dataToExport[0] || {}).join(',')
      const rows = dataToExport.map(obj => Object.values(obj).join(','))
      const csvContent = [headers, ...rows].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `branches_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Exported to CSV successfully')
    } else {
      // For Excel export, we'll create a simple HTML table that Excel can open
      const headers = Object.keys(dataToExport[0] || {}).join('\t')
      const rows = dataToExport.map(obj => Object.values(obj).join('\t'))
      const excelContent = [headers, ...rows].join('\n')
      
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `branches_export_${new Date().toISOString().split('T')[0]}.xls`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Exported to Excel successfully')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const arrayBuffer = event.target?.result
          if (!arrayBuffer) {
            reject(new Error('Unable to read file'))
            return
          }
          const workbook = XLSX.read(arrayBuffer, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
          resolve(rows as any[])
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  const normalizeKey = (key: string) =>
    key
      .toString()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[-_]/g, ' ')
      .replace(/[^a-z0-9 ]/gi, '')
      .toLowerCase()

  const normalizeBulkUploadRow = (row: any) => {
    const normalizedRow: Record<string, any> = {}
    Object.keys(row || {}).forEach((key) => {
      normalizedRow[normalizeKey(key)] = row[key]
    })

    const normalizeValue = (value: any) => {
      if (value === undefined || value === null) return ''
      return String(value).trim()
    }

    return {
      branchCode: normalizeValue(
        normalizedRow['branch code'] ??
          normalizedRow['branchcode'] ??
          normalizedRow['code'] ??
          normalizedRow['branch id'] ??
          normalizedRow['unique code'] ??
          normalizedRow['branch no'] ??
          normalizedRow['branch number'] ??
          normalizedRow['branchcode'],
      ),
      branchName: normalizeValue(
        normalizedRow['branch name'] ??
          normalizedRow['branchname'] ??
          normalizedRow['name'] ??
          normalizedRow['branch'] ??
          normalizedRow['branch_name'],
      ),
      state: normalizeValue(
        normalizedRow['state'] ??
          normalizedRow['branch state'] ??
          normalizedRow['branchstate'] ??
          normalizedRow['state name'],
      ),
      district: normalizeValue(
        normalizedRow['district'] ??
          normalizedRow['branch district'] ??
          normalizedRow['branchdistrict'],
      ),
      address: normalizeValue(
        normalizedRow['address'] ??
          normalizedRow['branch address'] ??
          normalizedRow['branchaddress'],
      ),
      place: normalizeValue(
        normalizedRow['place'] ??
          normalizedRow['location'] ??
          normalizedRow['branch location'] ??
          normalizedRow['branchplace'],
      ),
      pin: normalizeValue(
        normalizedRow['pin'] ??
          normalizedRow['pincode'] ??
          normalizedRow['branch pin'] ??
          normalizedRow['branchpin'],
      ),
      phoneNo: normalizeValue(
        normalizedRow['phone'] ??
          normalizedRow['phoneno'] ??
          normalizedRow['phone number'],
      ),
      mobileNo: normalizeValue(
        normalizedRow['mobile'] ??
          normalizedRow['mobileno'] ??
          normalizedRow['mobile number'],
      ),
      email: normalizeValue(
        normalizedRow['email'] ??
          normalizedRow['emailid'] ??
          normalizedRow['email address'],
      ),
      mgrname: normalizeValue(
        normalizedRow['manager name'] ??
          normalizedRow['mgrname'] ??
          normalizedRow['manager'],
      ),
      mgrMobile: normalizeValue(
        normalizedRow['manager mobile'] ??
          normalizedRow['mgrmobile'] ??
          normalizedRow['manager mobile number'],
      ),
      zoneId: normalizeValue(
        normalizedRow['zone id'] ?? normalizedRow['zoneid'] ?? normalizedRow['zone'],
      ),
      isActive: normalizedRow['active'] ?? normalizedRow['is active'] ?? normalizedRow['isactive'] ?? 1,
    }
  }

  const handleBulkUploadSubmit = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const rows = await parseExcelFile(selectedFile)
      const normalizedRows = rows.map(normalizeBulkUploadRow)
      const branches = normalizedRows.filter((row) => row.branchCode && row.branchName)

      if (branches.length === 0) {
        const sampleKeys = rows.length > 0 ? Object.keys(rows[0]).join(', ') : 'none'
        throw new Error(
          `No valid rows found. Make sure Branch Code and Branch Name are provided. Parsed row keys: ${sampleKeys}`,
        )
      }

      dispatch(bulkUploadBranchesResponseResetStart())
      dispatch(bulkUploadBranchesStart({ branches, create_by: 'Admin' }))
    } catch (error: any) {
      setUploading(false)
      toast.error(error?.message || 'Bulk upload file parsing failed')
    }
  }

  const handleBulkUpload = () => {
    setUploadModalOpen(true)
  }



  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-7 h-7 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RD Branch Master</h1>
            <p className="text-gray-600">Manage your branch locations</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <Button variant="outline" onClick={() => handleExport('excel')} leftIcon={<Download className="w-4 h-4" />}>
            Export Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')} leftIcon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleBulkUpload} leftIcon={<Upload className="w-4 h-4" />}>
            Bulk Upload
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-medium text-gray-700">
            Total branches: {filteredBranches.length}
          </div>
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search by code, name, district, state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading branches...</p>
          </div>
        )  : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th 
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('uniqueAreaID')}
                    >
                      Code {sortColumn === 'uniqueAreaID' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('AreaName')}
                    >
                      Name {sortColumn === 'AreaName' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('AreaDistrict')}
                    >
                      District {sortColumn === 'AreaDistrict' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('AreaState')}
                    >
                      State {sortColumn === 'AreaState' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('GroupCount')}
                    >
                      Groups {sortColumn === 'GroupCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('CenterCount')}
                    >
                      Centers {sortColumn === 'CenterCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('MemberCount')}
                    >
                      Members {sortColumn === 'MemberCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('isSubBranch')}
                    >
                      Type {sortColumn === 'isSubBranch' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.map((branch: Branch) => (
                    <tr key={branch.AreaID} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{branch.uniqueAreaID}</td>
                      <td className="py-3 px-4">
                        {branch.AreaName}
                        {branch.isHeadOfficeText && <Badge variant="success" className="ml-2">{branch.isHeadOfficeText}</Badge>}
                        {branch.isSubBranchText && <Badge variant="info" className="ml-2">{branch.isSubBranchText}</Badge>}
                      </td>
                      <td className="py-3 px-4">{branch.AreaDistrict}</td>
                      <td className="py-3 px-4">{branch.AreaState}</td>
                      <td className="py-3 px-4">{branch.GroupCount}</td>
                      <td className="py-3 px-4">{branch.CenterCount}</td>
                      <td className="py-3 px-4">{branch.MemberCount}</td>
                      {/* <td className="py-3 px-4">
                        {branch.isSubBranch === 1 ? 'Sub Branch' : 'Main Branch'}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {filteredBranches.length} branches
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <span className="flex items-center px-2 text-sm text-gray-600">
                  Page {currentPage + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={filteredBranches.length < 20}
                  leftIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>


      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Bulk Upload Branches"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Upload an Excel file (.xlsx/.xls) containing branch data. The file should include columns for Branch Code, Name, District, State, etc.
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              className="hidden" 
              id="file-upload" 
              onChange={handleFileSelect}
            />
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              Select File
            </Button>
          </div>
          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{selectedFile.name}</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                Remove
              </Button>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkUploadSubmit} 
              disabled={!selectedFile || uploading}
              isLoading={uploading}
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default BranchList;
