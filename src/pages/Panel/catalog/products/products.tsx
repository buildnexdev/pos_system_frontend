import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  Package,
  Plus,
  Search,
  LayoutGrid,
  Table2,
  Pencil,
  Trash2,
  X,
  Hash,
  IndianRupee,
  Save,
  Image as ImageIcon,
  Tag,
  Star,
  Type,
  FolderTree,
  Tags,
  Percent,
  Palette,
  Ruler,
  Shirt,
  Users,
  Upload,
  Camera,
  FileText,
  Eye,
  RefreshCw,
  Globe,
  Layers,
  ShoppingBag,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  Printer,
  Tag as TagIcon,
} from 'lucide-react';
import { catalogServices } from '../../../../redux/catalog/catalog.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import {
  buildPriceTagRows,
  downloadPriceTagsHtml,
  printPriceTags,
} from '../../../../utils/priceTag';
import { downloadBarcodePng, safeBarcodeFileName } from '../../../../utils/barcode';
import './products.scss';

const schema = Yup.object({
  name: Yup.string().trim().required('Product name is required'),
  sku: Yup.string().trim().required('Product code is required'),
  category_id: Yup.mixed()
    .test('required', 'Category is required', (v) => v !== '' && v !== null && v !== undefined)
    .required('Category is required'),
  product_type_id: Yup.mixed()
    .test('required', 'Product type is required', (v) => v !== '' && v !== null && v !== undefined)
    .required('Product type is required'),
  gender: Yup.string().required('Gender is required'),
  price: Yup.number()
    .transform((value, original) => (original === '' || original == null ? undefined : value))
    .typeError('MRP is required')
    .required('MRP is required')
    .min(0, 'MRP must be 0 or more'),
  sale_price: Yup.number()
    .transform((value, original) => (original === '' || original == null ? undefined : value))
    .nullable()
    .test('lte-mrp', 'Selling price cannot exceed MRP', function (value) {
      if (value == null || value === ('' as any)) return true;
      const mrp = Number(this.parent.price);
      if (!Number.isFinite(mrp)) return true;
      return Number(value) <= mrp;
    }),
});

const COLOR_OPTIONS = [
  'Black', 'White', 'Red', 'Blue', 'Navy', 'Green', 'Yellow', 'Pink', 'Grey', 'Beige', 'Brown', 'Maroon', 'Olive', 'Purple',
];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', 'One Size'];
const FABRIC_OPTIONS = ['Cotton', 'Linen', 'Polyester', 'Silk', 'Wool', 'Denim', 'Rayon', 'Blend'];
const MATERIAL_OPTIONS = ['100% Cotton', 'Cotton Blend', 'Polyester', 'Silk Blend', 'Linen Blend'];
const PATTERN_OPTIONS = ['Solid', 'Striped', 'Checked', 'Printed', 'Embroidered', 'Floral'];
const FIT_OPTIONS = ['Regular', 'Slim', 'Relaxed', 'Oversized', 'Tailored'];
const SLEEVE_OPTIONS = ['Full Sleeve', 'Half Sleeve', 'Short Sleeve', 'Sleeveless', '3/4 Sleeve'];
const NECK_OPTIONS = ['Round Neck', 'V-Neck', 'Collar', 'Mandarin', 'Hooded', 'Boat Neck'];
const OCCASION_OPTIONS = ['Casual', 'Formal', 'Party', 'Festive', 'Sports', 'Ethnic'];
const SEASON_OPTIONS = ['All Season', 'Summer', 'Winter', 'Monsoon', 'Spring'];

const SECTIONS = [
  { key: 'basic', label: 'Basic Information', icon: Type },
  { key: 'attributes', label: 'Product Attributes', icon: Shirt },
  { key: 'variants', label: 'Size & Colour', icon: Palette },
  { key: 'pricing', label: 'Pricing & Tax', icon: IndianRupee },
  { key: 'images', label: 'Product Images', icon: ImageIcon },
  { key: 'store', label: 'Online Store', icon: Globe },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

const FIELD_SECTION: Record<string, SectionKey> = {
  name: 'basic',
  sku: 'basic',
  category_id: 'basic',
  product_type_id: 'basic',
  gender: 'basic',
  price: 'pricing',
  sale_price: 'pricing',
  discount_value: 'pricing',
};

type CatalogVariant = {
  key: string;
  id?: number | null;
  color: string;
  size: string;
  stock_code: string;
  barcode: string;
  image_url: string;
  is_active: boolean;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateProductCode() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `PRD-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function colorCode(color: string) {
  const map: Record<string, string> = {
    Black: 'BLK', White: 'WHT', Red: 'RED', Blue: 'BLU', Navy: 'NVY', Green: 'GRN',
    Yellow: 'YLW', Pink: 'PNK', Grey: 'GRY', Beige: 'BGE', Brown: 'BRN', Maroon: 'MRN',
    Olive: 'OLV', Purple: 'PRP',
  };
  if (map[color]) return map[color];
  return (color || 'CLR').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'CLR';
}

function makeVariantKey() {
  return `cv-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

function buildVariantSku(productCode: string, color: string, size: string) {
  return `${productCode || 'PRD'}-${colorCode(color)}-${(size || 'OS').replace(/\s+/g, '').toUpperCase()}`;
}

function createVariant(partial?: Partial<CatalogVariant>, productCode?: string): CatalogVariant {
  const color = partial?.color || 'Black';
  const size = partial?.size || 'M';
  const code = partial?.stock_code || buildVariantSku(productCode || generateProductCode(), color, size);
  return {
    key: partial?.key || makeVariantKey(),
    id: partial?.id ?? null,
    color,
    size,
    stock_code: code,
    barcode: partial?.barcode || code,
    image_url: partial?.image_url || '',
    is_active: partial?.is_active !== false,
  };
}

function variantsFromProduct(item: any): CatalogVariant[] {
  if (!Array.isArray(item?.variants) || !item.variants.length) return [];
  return item.variants.map((v: any) =>
    createVariant({
      key: `db-${v.id}`,
      id: v.id,
      color: v.color,
      size: v.size,
      stock_code: v.stock_code || v.sku,
      barcode: v.barcode || v.stock_code,
      image_url: v.image_url || '',
      is_active: v.is_active !== 0 && v.is_active !== false,
    })
  );
}

function calcSalePrice(
  mrp: string | number,
  discountType: string,
  discountValue: string | number
) {
  const price = Number(mrp) || 0;
  const discount = Number(discountValue) || 0;
  if (!price || discount <= 0) return price || '';
  if (discountType === 'fixed') return Number(Math.max(0, price - discount).toFixed(2));
  return Number((price - (price * discount) / 100).toFixed(2));
}

function priceTagProductFromForm(values: any, companyName?: string | null) {
  const mrp = values.price === '' || values.price == null ? null : Number(values.price);
  const sale =
    values.sale_price === '' || values.sale_price == null
      ? mrp
      : Number(values.sale_price);
  return {
    name: values.name || 'Product',
    brand: companyName || values.brand || 'BuildNex ShopOS',
    sku: values.sku,
    barcode: values.sku,
    stock_code: values.sku,
    price: mrp,
    sale_price: sale,
    variants: (values.variants || [])
      .filter((v: CatalogVariant) => v.size && v.color)
      .map((v: CatalogVariant) => ({
        size: v.size,
        color: v.color,
        stock_code: v.stock_code,
        barcode: v.barcode || v.stock_code,
        price: mrp,
      })),
  };
}

function priceTagProductFromRecord(product: any, companyName?: string | null) {
  const mrp = product?.price === '' || product?.price == null ? null : Number(product.price);
  const sale =
    product?.sale_price === '' || product?.sale_price == null
      ? mrp
      : Number(product.sale_price);
  return {
    name: product?.name || 'Product',
    brand: companyName || product?.brand || 'BuildNex ShopOS',
    sku: product?.sku,
    barcode: product?.barcode || product?.sku,
    stock_code: product?.stock_code || product?.sku,
    price: mrp,
    sale_price: sale,
    variants: (product?.variants || [])
      .filter((v: any) => v?.size && v?.color)
      .map((v: any) => ({
        size: v.size,
        color: v.color,
        stock_code: v.stock_code || v.sku,
        barcode: v.barcode || v.stock_code || v.sku,
        price: v.price != null && v.price !== '' ? Number(v.price) : mrp,
      })),
  };
}

function showGarmentAttrs(categoryName?: string) {
  const name = String(categoryName || '').toLowerCase();
  if (!name) return true;
  return !name.includes('accessor');
}

export default function CatalogProductsPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canCreate = hasRight(rights, user, 'product', 'create');
  const canEdit = hasRight(rights, user, 'product', 'edit');
  const canDelete = hasRight(rights, user, 'product', 'delete');
  const priceTagBrand = useMemo(
    () => ({
      name: user?.companyName || undefined,
      logoUrl: user?.companyLogo || undefined,
      website: user?.companyWebsite || undefined,
    }),
    [user?.companyName, user?.companyLogo, user?.companyWebsite]
  );

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [q, setQ] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  const [section, setSection] = useState<SectionKey>('basic');
  const [uploading, setUploading] = useState(false);
  const [draftCode, setDraftCode] = useState(() => generateProductCode());
  const [gallery, setGallery] = useState<string[]>([]);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [seedVariants, setSeedVariants] = useState<CatalogVariant[]>(() => {
    const code = generateProductCode();
    return [
      createVariant({ color: 'Black', size: 'M' }, code),
      createVariant({ color: 'White', size: 'M' }, code),
    ];
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const variantUploadTarget = useRef<{
    index: number;
    setFieldValue: (f: string, v: any) => void;
  } | null>(null);
  const formValuesRef = useRef<{ variants: CatalogVariant[] }>({ variants: [] });
  const variantFileRef = useRef<HTMLInputElement>(null);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(String(p.brand));
    });
    return Array.from(set).sort();
  }, [products]);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c, t] = await Promise.all([
        catalogServices.http.get('/panel/products'),
        catalogServices.http.get('/panel/categories'),
        catalogServices.http.get('/panel/product-types'),
      ]);
      setProducts(p.data.products || []);
      setCategories(c.data.categories || []);
      setTypes(t.data.items || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (formOpen) {
      requestAnimationFrame(() => setFormVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setFormVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [formOpen]);

  const filtered = products.filter((p) => {
    const term = q.trim().toLowerCase();
    if (term) {
      const hay = `${p.name} ${p.sku} ${p.brand} ${p.category_name} ${p.product_type_name}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    if (filterCategory && String(p.category_id) !== String(filterCategory)) return false;
    if (filterBrand && String(p.brand || '') !== filterBrand) return false;
    if (filterType && String(p.product_type_id) !== String(filterType)) return false;
    if (filterStatus === 'active' && !p.is_active) return false;
    if (filterStatus === 'inactive' && p.is_active) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [q, filterCategory, filterBrand, filterType, filterStatus, pageSize]);

  const openCreate = () => {
    const code = generateProductCode();
    setEditing(null);
    setDraftCode(code);
    setSeedVariants([
      createVariant({ color: 'Black', size: 'M' }, code),
      createVariant({ color: 'White', size: 'M' }, code),
    ]);
    setGallery([]);
    setSection('basic');
    setFormInstanceKey((k) => k + 1);
    setFormOpen(true);
  };

  const openEdit = async (item: any) => {
    setSection('basic');
    try {
      const { data } = await catalogServices.http.get(`/panel/products/${item.id}`);
      const product = data.product || item;
      const images = data.images || [];
      setEditing({
        ...product,
        image: product.image || images.find((i: any) => i.is_primary)?.image_url || item.image,
        category_name: item.category_name,
        product_type_name: item.product_type_name || product.product_type_name,
      });
      setGallery(
        images
          .filter((i: any) => !i.is_primary)
          .map((i: any) => i.image_url)
          .filter(Boolean)
      );
    } catch {
      setEditing(item);
      setGallery([]);
    }
    setFormInstanceKey((k) => k + 1);
    setFormOpen(true);
  };

  const openView = async (item: any) => {
    try {
      const { data } = await catalogServices.http.get(`/panel/products/${item.id}`);
      setViewing({ ...(data.product || item), images: data.images || [], category_name: item.category_name });
    } catch {
      setViewing(item);
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setGallery([]);
  };

  const downloadMappedPriceTags = async (item: any, mode: 'download' | 'print' = 'download') => {
    if (!item?.id) {
      toast.error('Product not found');
      return;
    }
    try {
      let product = item;
      const alreadyMapped =
        Array.isArray(item.variants) &&
        item.variants.some((v: any) => String(v?.size || '').trim() && String(v?.color || '').trim());
      if (!alreadyMapped) {
        const { data } = await catalogServices.http.get(`/panel/products/${item.id}`);
        product = data.product || item;
      }
      const tagItem = priceTagProductFromRecord(product, user?.companyName);
      if (!tagItem.variants?.length) {
        toast.error('No size/colour variants mapped for this product');
        return;
      }
      const rows = buildPriceTagRows(tagItem);
      if (!rows.length) {
        toast.error('No size/colour variants mapped for this product');
        return;
      }
      if (mode === 'print') {
        if (!printPriceTags(tagItem, rows, priceTagBrand)) {
          toast.error('Allow popups to print price tags');
          return;
        }
        toast.success(`Printing ${rows.length} price tag${rows.length > 1 ? 's' : ''}`);
        return;
      }
      downloadPriceTagsHtml(tagItem, rows, product.sku || product.name, priceTagBrand);
      toast.success(`Downloaded ${rows.length} price tag${rows.length > 1 ? 's' : ''}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not load product for price tags');
    }
  };

  const onDelete = async (item: any) => {
    if (!confirm(`Delete product "${item.name}"?`)) return;
    try {
      await catalogServices.http.delete(`/panel/products/${item.id}`);
      toast.success('Product deleted');
      load();
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Delete failed';
      toast.error(msg);
      if (String(msg).toLowerCase().includes('inactive')) {
        const setInactive = confirm('Set this product to Inactive instead?');
        if (setInactive) {
          try {
            await catalogServices.http.put(`/panel/products/${item.id}`, {
              ...item,
              catalog_mode: true,
              is_active: false,
              name: item.name,
              sku: item.sku,
              category_id: item.category_id,
              price: item.price,
              variants: (item.variants || []).map((v: any) => ({
                size: v.size,
                color: v.color,
                stock_code: v.stock_code,
                barcode: v.barcode,
                image_url: v.image_url,
                is_active: v.is_active !== 0,
              })),
            });
            toast.success('Product set to Inactive');
            load();
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Could not set inactive');
          }
        }
      }
    }
  };

  const exportCsv = () => {
    const headers = [
      'S.No', 'Product Name', 'Product Code', 'Category', 'Brand', 'Product Type', 'MRP', 'Sale Price', 'Variants', 'Status',
    ];
    const lines = [headers.join(',')];
    filtered.forEach((p, index) => {
      const cols = [
        index + 1,
        `"${String(p.name || '').replace(/"/g, '""')}"`,
        p.sku || '',
        `"${String(p.category_name || '').replace(/"/g, '""')}"`,
        `"${String(p.brand || '').replace(/"/g, '""')}"`,
        `"${String(p.product_type_name || '').replace(/"/g, '""')}"`,
        Number(p.price || 0).toFixed(2),
        Number(p.sale_price || p.price || 0).toFixed(2),
        Number(p.variant_count || p.variants?.length || 0),
        p.is_active ? 'Active' : 'Inactive',
      ];
      lines.push(cols.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Product list exported');
  };

  const duplicateProduct = async (item: any) => {
    try {
      const { data } = await catalogServices.http.get(`/panel/products/${item.id}`);
      const product = data.product || item;
      const images = data.images || [];
      const code = generateProductCode();
      const variants = (product.variants || []).map((v: any) => {
        const stock_code = buildVariantSku(code, v.color, v.size);
        return {
          size: v.size,
          color: v.color,
          stock_code,
          barcode: stock_code,
          image_url: v.image_url || null,
          is_active: v.is_active !== 0 && v.is_active !== false,
          price: product.price,
          discount: product.discount_percent || 0,
        };
      });
      await catalogServices.http.post('/panel/products', {
        catalog_mode: true,
        name: `${product.name} (Copy)`,
        slug: slugify(`${product.name} copy ${Date.now()}`),
        sku: code,
        stock_code: code,
        barcode: code,
        category_id: product.category_id,
        subcategory: product.subcategory || null,
        product_type_id: product.product_type_id || null,
        brand: product.brand || 'BuildNex ShopOS',
        gender: product.gender || 'unisex',
        description: product.description || '',
        fabric: product.fabric || null,
        material: product.material || null,
        pattern: product.pattern || null,
        fit_type: product.fit_type || null,
        sleeve_type: product.sleeve_type || null,
        neck_type: product.neck_type || null,
        occasion: product.occasion || null,
        season: product.season || null,
        country_of_origin: product.country_of_origin || null,
        purchase_price: product.purchase_price ?? null,
        price: Number(product.price) || 0,
        sale_price: product.sale_price ?? null,
        discount_type: product.discount_type || 'percent',
        discount_value: product.discount_value ?? product.discount_percent ?? 0,
        discount_percent: product.discount_percent || 0,
        hsn_code: product.hsn_code || null,
        gst_rate: product.gst_rate || 0,
        tax_inclusive: product.tax_inclusive !== 0,
        image_url: product.image || images.find((i: any) => i.is_primary)?.image_url || null,
        gallery_images: images.filter((i: any) => !i.is_primary).map((i: any) => i.image_url),
        publish_online: !!product.publish_online,
        is_featured: false,
        is_new_arrival: !!product.is_new_arrival,
        is_best_seller: false,
        visibility: product.visibility || 'public',
        is_active: true,
        seo_title: product.seo_title || null,
        seo_description: product.seo_description || null,
        variants,
      });
      toast.success('Product duplicated');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Duplicate failed');
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return null;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await catalogServices.http.post('/panel/upload/product-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data?.data?.url || data?.url;
      if (!url) throw new Error('Upload failed');
      toast.success('Image uploaded');
      return url;
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const initialValues = useMemo(() => {
    const initialVariants = editing ? variantsFromProduct(editing) : seedVariants;
    return {
      name: editing?.name || '',
      sku: editing?.sku || (editing ? '' : draftCode),
      category_id: String(editing?.category_id || categories[0]?.id || ''),
      subcategory: editing?.subcategory || '',
      product_type_id: String(editing?.product_type_id || types[0]?.id || ''),
      brand: editing?.brand || 'BuildNex ShopOS',
      gender: editing?.gender || 'unisex',
      description: editing?.description || '',
      fabric: editing?.fabric || '',
      material: editing?.material || '',
      pattern: editing?.pattern || '',
      fit_type: editing?.fit_type || '',
      sleeve_type: editing?.sleeve_type || '',
      neck_type: editing?.neck_type || '',
      occasion: editing?.occasion || '',
      season: editing?.season || '',
      country_of_origin: editing?.country_of_origin || 'India',
      variants: initialVariants,
      purchase_price: editing?.purchase_price ?? '',
      price: editing?.price ?? '',
      sale_price: editing?.sale_price ?? '',
      discount_type: editing?.discount_type || 'percent',
      discount_value: editing?.discount_value ?? editing?.discount_percent ?? '',
      hsn_code: editing?.hsn_code || '',
      gst_rate: editing?.gst_rate ?? '',
      tax_inclusive: editing ? editing.tax_inclusive !== 0 && editing.tax_inclusive !== false : true,
      image_url: editing?.image || editing?.image_url || '',
      publish_online: editing ? editing.publish_online !== 0 && editing.publish_online !== false : true,
      is_featured: editing ? !!editing.is_featured : false,
      is_new_arrival: editing ? !!editing.is_new_arrival : false,
      is_best_seller: editing ? !!editing.is_best_seller : false,
      visibility: editing?.visibility || 'public',
      is_active: editing ? !!editing.is_active : true,
      seo_title: editing?.seo_title || '',
      seo_description: editing?.seo_description || '',
    };
  }, [editing, seedVariants, draftCode, categories, types, formInstanceKey]);

  return (
    <div className="cat-page">
      <div className="cat-panel">
        <div className="cat-toolbar">
          <div className="cat-hero">
            <div className="cat-hero-icon"><ShoppingBag size={22} /></div>
            <div>
              <h1>Product Management</h1>
              <p>Catalog master · stock stays in Stock module · <strong>{products.length}</strong> products</p>
            </div>
          </div>

          <div className="cat-toolbar-actions">
            <label className="cat-search">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product" />
            </label>
            <select className="cat-filter" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">Filter Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select className="cat-filter" value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
              <option value="">Filter Brand</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select className="cat-filter" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Filter Product Type</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select className="cat-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Filter Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="cat-view-toggle" role="group" aria-label="View mode">
              <button type="button" className={view === 'table' ? 'is-active' : ''} onClick={() => setView('table')} title="List view">
                <Table2 size={16} />
              </button>
              <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} title="Grid view">
                <LayoutGrid size={16} />
              </button>
            </div>
            <button type="button" className="cat-mini-btn" onClick={exportCsv} title="Export CSV">
              <Download size={15} /> Export
            </button>
            {canCreate && (
              <button type="button" className="cat-btn-add" onClick={openCreate}>
                <Plus size={16} /> Add Product
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="cat-loading"><Loader /><p>Loading products...</p></div>
        ) : view === 'table' ? (
          <div className="cat-table-wrap">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Product Code</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Product Type</th>
                  <th>MRP</th>
                  <th>Sale Price</th>
                  <th>Variants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={12} className="cat-empty">No products found.</td></tr>
                ) : (
                  paged.map((p, index) => {
                    const variantCount = Number(p.variant_count || p.variants?.length || 0);
                    const sizeCount = String(p.sizes || '').split(',').filter(Boolean).length;
                    const colorCount = String(p.colors || '').split(',').filter(Boolean).length;
                    return (
                      <tr key={p.id}>
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>
                          <span className="cat-thumb">
                            {p.image ? <img src={p.image} alt={p.name} /> : <Package size={16} />}
                          </span>
                        </td>
                        <td><strong>{p.name}</strong></td>
                        <td><span className="cat-code">{p.sku}</span></td>
                        <td>{p.category_name || '—'}</td>
                        <td>{p.brand || '—'}</td>
                        <td>{p.product_type_name || '—'}</td>
                        <td>₹{Number(p.price || 0).toFixed(0)}</td>
                        <td>₹{Number(p.sale_price || p.price || 0).toFixed(0)}</td>
                        <td>
                          <span className="cat-variant-pill">
                            {variantCount || sizeCount * colorCount || 0}
                            <em>{colorCount || 0}C · {sizeCount || 0}S</em>
                          </span>
                        </td>
                        <td>
                          <span className={`cat-badge ${p.is_active ? 'is-on' : 'is-off'}`}>
                            {p.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="cat-actions">
                            <button type="button" className="icon-action" title="View" onClick={() => openView(p)}><Eye size={15} /></button>
                            {canEdit && (
                              <button type="button" className="icon-action edit" title="Edit" onClick={() => openEdit(p)}><Pencil size={15} /></button>
                            )}
                            <button
                              type="button"
                              className="icon-action download"
                              title="Download price tags"
                              onClick={() => downloadMappedPriceTags(p, 'download')}
                            >
                              <Download size={15} />
                            </button>
                            <button
                              type="button"
                              className="icon-action print"
                              title="Print price tags"
                              onClick={() => downloadMappedPriceTags(p, 'print')}
                            >
                              <Printer size={15} />
                            </button>
                            {canCreate && (
                              <button type="button" className="icon-action" title="Duplicate" onClick={() => duplicateProduct(p)}><Copy size={15} /></button>
                            )}
                            {canDelete && (
                              <button type="button" className="icon-action delete" title="Delete" onClick={() => onDelete(p)}><Trash2 size={15} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="cat-pagination">
              <select className="cat-filter" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <span>{filtered.length} products · Page {currentPage} / {totalPages}</span>
              <div className="cat-actions">
                <button type="button" className="icon-action" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft size={15} />
                </button>
                <button type="button" className="icon-action" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="cat-grid">
            {paged.length === 0 ? (
              <div className="cat-empty">No products found.</div>
            ) : (
              paged.map((p) => (
                <article key={p.id} className="cat-card">
                  <div className="cat-card-media">
                    {p.image ? <img src={p.image} alt={p.name} /> : <div className="cat-card-placeholder"><Package size={28} /></div>}
                    {!!p.is_featured && <span className="cat-featured"><Star size={12} /> Featured</span>}
                  </div>
                  <div className="cat-card-body">
                    <h3>{p.name}</h3>
                    <p className="cat-code">{p.sku}</p>
                    <p className="cat-card-meta">{p.category_name || '—'} · {p.brand || '—'}</p>
                    <div className="cat-card-foot">
                      <strong>₹{Number(p.sale_price || p.price || 0).toFixed(0)}</strong>
                      <div className="cat-actions">
                        <button type="button" className="icon-action" title="View" onClick={() => openView(p)}><Eye size={15} /></button>
                        {canEdit && <button type="button" className="icon-action edit" title="Edit" onClick={() => openEdit(p)}><Pencil size={15} /></button>}
                        <button type="button" className="icon-action download" title="Download price tags" onClick={() => downloadMappedPriceTags(p, 'download')}><Download size={15} /></button>
                        <button type="button" className="icon-action print" title="Print price tags" onClick={() => downloadMappedPriceTags(p, 'print')}><Printer size={15} /></button>
                        {canCreate && <button type="button" className="icon-action" title="Duplicate" onClick={() => duplicateProduct(p)}><Copy size={15} /></button>}
                        {canDelete && <button type="button" className="icon-action delete" title="Delete" onClick={() => onDelete(p)}><Trash2 size={15} /></button>}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>

      {viewing &&
        createPortal(
          <div className="cat-view-overlay">
            <div className="cat-view-backdrop" onClick={() => setViewing(null)} />
            <div className="cat-view-card" role="dialog" aria-modal="true">
              <button type="button" className="cat-oc-close" onClick={() => setViewing(null)} aria-label="Close"><X size={18} /></button>
              <div className="cat-view-head">
                <span className="cat-thumb lg">{viewing.image ? <img src={viewing.image} alt="" /> : <Package size={20} />}</span>
                <div>
                  <h2>{viewing.name}</h2>
                  <p>{viewing.sku} · {viewing.category_name || '—'} · {viewing.brand || '—'}</p>
                </div>
              </div>
              <div className="cat-view-grid">
                <div><label>MRP</label><p>₹{Number(viewing.price || 0).toFixed(2)}</p></div>
                <div><label>Sale Price</label><p>₹{Number(viewing.sale_price || viewing.price || 0).toFixed(2)}</p></div>
                <div><label>Type</label><p>{viewing.product_type_name || '—'}</p></div>
                <div><label>Gender</label><p className="capitalize">{viewing.gender || '—'}</p></div>
                <div><label>Status</label><p>{viewing.is_active ? 'Active' : 'Inactive'}</p></div>
                <div><label>Online</label><p>{viewing.publish_online ? 'Published' : 'Unpublished'}</p></div>
              </div>
              {!!viewing.description && <p className="cat-view-desc">{viewing.description}</p>}
              <div className="cat-view-actions">
                {canEdit && (
                  <button type="button" className="cat-btn primary" onClick={() => { setViewing(null); openEdit(viewing); }}>
                    <Pencil size={15} /> Edit Product
                  </button>
                )}
                <button type="button" className="cat-btn ghost" onClick={() => downloadMappedPriceTags(viewing, 'download')}>
                  <Download size={15} /> Download Price Tag
                </button>
                <button type="button" className="cat-btn ghost" onClick={() => downloadMappedPriceTags(viewing, 'print')}>
                  <Printer size={15} /> Print
                </button>
                <button type="button" className="cat-btn ghost" onClick={() => setViewing(null)}>Close</button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {formOpen &&
        createPortal(
          <div className={`cat-overlay ${formVisible ? 'is-open' : ''}`}>
            <div className="cat-backdrop" onClick={closeForm} />
            <aside className={`cat-offcanvas ${formVisible ? 'is-open' : ''}`} role="dialog" aria-modal="true">
              <button type="button" className="cat-oc-close" onClick={closeForm} aria-label="Close"><X size={18} /></button>
              <div className="cat-oc-head">
                <span className="cat-oc-icon"><Package size={20} /></span>
                <div>
                  <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
                  <p>6 sections · inventory qty managed in Stock</p>
                </div>
              </div>

              <Formik
                key={formInstanceKey}
                enableReinitialize={false}
                initialValues={initialValues}
                validationSchema={schema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const sale = calcSalePrice(values.price, values.discount_type, values.discount_value);
                    const variants = (values.variants || [])
                      .filter((v: CatalogVariant) => v.size && v.color && v.stock_code)
                      .map((v: CatalogVariant) => ({
                        size: v.size,
                        color: v.color,
                        stock_code: v.stock_code,
                        barcode: v.barcode || v.stock_code,
                        image_url: v.image_url || null,
                        is_active: v.is_active !== false,
                        price: values.price === '' || values.price == null ? null : Number(values.price),
                        discount:
                          values.discount_type === 'percent'
                            ? Number(values.discount_value) || 0
                            : 0,
                      }));

                    if (!values.name?.trim()) {
                      toast.error('Product name is required');
                      setSection('basic');
                      setSubmitting(false);
                      return;
                    }
                    if (!values.category_id || !values.product_type_id) {
                      toast.error('Category and Product Type are required');
                      setSection('basic');
                      setSubmitting(false);
                      return;
                    }
                    if (values.price === '' || values.price == null || Number.isNaN(Number(values.price))) {
                      toast.error('MRP is required');
                      setSection('pricing');
                      setSubmitting(false);
                      return;
                    }
                    if (
                      values.sale_price !== '' &&
                      values.sale_price != null &&
                      Number(values.sale_price) > Number(values.price)
                    ) {
                      toast.error('Selling price cannot exceed MRP');
                      setSection('pricing');
                      setSubmitting(false);
                      return;
                    }
                    if (!variants.length) {
                      toast.error('Add at least one colour/size variant');
                      setSection('variants');
                      setSubmitting(false);
                      return;
                    }

                    const payload = {
                      catalog_mode: true,
                      name: values.name,
                      slug: slugify(values.name),
                      sku: values.sku,
                      stock_code: values.sku,
                      barcode: values.sku,
                      category_id: Number(values.category_id),
                      subcategory: values.subcategory || null,
                      product_type_id: values.product_type_id ? Number(values.product_type_id) : null,
                      brand: values.brand || 'BuildNex ShopOS',
                      gender: values.gender,
                      description: values.description || '',
                      fabric: values.fabric || null,
                      material: values.material || null,
                      pattern: values.pattern || null,
                      fit_type: values.fit_type || null,
                      sleeve_type: values.sleeve_type || null,
                      neck_type: values.neck_type || null,
                      occasion: values.occasion || null,
                      season: values.season || null,
                      country_of_origin: values.country_of_origin || null,
                      purchase_price:
                        values.purchase_price === '' || values.purchase_price == null
                          ? null
                          : Number(values.purchase_price),
                      price: Number(values.price),
                      sale_price: sale === '' ? null : Number(sale),
                      discount_type: values.discount_type,
                      discount_value: Number(values.discount_value) || 0,
                      discount_percent:
                        values.discount_type === 'percent' ? Number(values.discount_value) || 0 : 0,
                      hsn_code: values.hsn_code || null,
                      gst_rate: values.gst_rate === '' ? 0 : Number(values.gst_rate),
                      tax_inclusive: !!values.tax_inclusive,
                      image_url: values.image_url || null,
                      gallery_images: gallery,
                      publish_online: !!values.publish_online,
                      is_featured: !!values.is_featured,
                      is_new_arrival: !!values.is_new_arrival,
                      is_best_seller: !!values.is_best_seller,
                      visibility: values.visibility,
                      is_active: !!values.is_active,
                      seo_title: values.seo_title || null,
                      seo_description: values.seo_description || null,
                      variants,
                    };
                    if (editing) await catalogServices.http.put(`/panel/products/${editing.id}`, payload);
                    else await catalogServices.http.post('/panel/products', payload);
                    toast.success(editing ? 'Product updated' : 'Product created');
                    closeForm();
                    load();
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Save failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ values, setFieldValue, errors, touched, isSubmitting, validateForm, setTouched, submitForm }) => {
                  formValuesRef.current = values;
                  const categoryName = categories.find((c) => String(c.id) === String(values.category_id))?.name;
                  const garmentAttrs = showGarmentAttrs(categoryName);

                  const handleSaveClick = async () => {
                    const formErrors = await validateForm();
                    const keys = Object.keys(formErrors || {});
                    if (keys.length) {
                      const touchMap: Record<string, boolean> = {};
                      keys.forEach((k) => {
                        touchMap[k] = true;
                      });
                      setTouched(touchMap as any, true);
                      const firstKey = keys[0];
                      const targetSection = FIELD_SECTION[firstKey] || 'basic';
                      setSection(targetSection);
                      toast.error(String((formErrors as any)[firstKey] || 'Please fill required fields'));
                      return;
                    }

                    const incomplete = (values.variants || []).filter(
                      (v: CatalogVariant) => !v.color || !v.size || !v.stock_code
                    );
                    if ((values.variants || []).length === 0) {
                      setSection('variants');
                      toast.error('Add at least one colour/size variant');
                      return;
                    }
                    if (incomplete.length) {
                      setSection('variants');
                      toast.error('Each variant needs colour, size and SKU');
                      return;
                    }

                    await submitForm();
                  };

                  return (
                    <Form className="cat-oc-body">
                      <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadImage(file);
                        if (url) setFieldValue('image_url', url);
                        e.target.value = '';
                      }} />
                      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadImage(file);
                        if (url) setFieldValue('image_url', url);
                        e.target.value = '';
                      }} />
                      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadImage(file);
                        if (url) setGallery((prev) => [...prev, url]);
                        e.target.value = '';
                      }} />
                      <input ref={variantFileRef} type="file" accept="image/*" hidden onChange={async (e) => {
                        const file = e.target.files?.[0];
                        const target = variantUploadTarget.current;
                        if (!file || !target) return;
                        const url = await uploadImage(file);
                        if (url) {
                          const current = formValuesRef.current.variants || [];
                          const next = current.map((v, i) =>
                            i === target.index ? { ...v, image_url: url } : v
                          );
                          target.setFieldValue('variants', next);
                        }
                        e.target.value = '';
                      }} />

                      <nav className="cat-sections">
                        {SECTIONS.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              className={`cat-section-btn ${section === item.key ? 'is-active' : ''}`}
                              onClick={() => setSection(item.key)}
                            >
                              <Icon size={15} />
                              {item.label}
                            </button>
                          );
                        })}
                      </nav>

                      <div className="cat-form-scroll">
                        {section === 'basic' && (
                          <section className="cat-form-section">
                            <div className="cat-section-head">
                              <h3>Section 1 · Basic Information</h3>
                              <p>Core product identity for the catalog</p>
                            </div>
                            <div className="cat-form-grid">
                              <div>
                                <label><Type size={14} /> Product Name *</label>
                                <Field name="name" className="cat-input" placeholder="Product name" />
                                {touched.name && errors.name && <p className="cat-error">{String(errors.name)}</p>}
                              </div>
                              <div>
                                <label><Hash size={14} /> Product Code *</label>
                                <div className="cat-code-row">
                                  <Field name="sku" className="cat-input" readOnly />
                                  <button
                                    type="button"
                                    className="cat-mini-btn"
                                    onClick={() => {
                                      const code = generateProductCode();
                                      setFieldValue('sku', code);
                                      setDraftCode(code);
                                      const next = (values.variants || []).map((v: CatalogVariant) => {
                                        const stock_code = buildVariantSku(code, v.color, v.size);
                                        return { ...v, stock_code, barcode: stock_code };
                                      });
                                      setFieldValue('variants', next);
                                    }}
                                  >
                                    <RefreshCw size={14} /> Auto
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label><Tags size={14} /> Product Type *</label>
                                <Field as="select" name="product_type_id" className="cat-input">
                                  <option value="">Select type</option>
                                  {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </Field>
                                {touched.product_type_id && errors.product_type_id && <p className="cat-error">{String(errors.product_type_id)}</p>}
                              </div>
                              <div>
                                <label><FolderTree size={14} /> Category *</label>
                                <Field as="select" name="category_id" className="cat-input">
                                  <option value="">Select category</option>
                                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Field>
                                {touched.category_id && errors.category_id && <p className="cat-error">{String(errors.category_id)}</p>}
                              </div>
                              <div>
                                <label><Layers size={14} /> Subcategory</label>
                                <Field name="subcategory" className="cat-input" placeholder="Optional" />
                              </div>
                              <div>
                                <label><Tag size={14} /> Brand</label>
                                <Field name="brand" className="cat-input" placeholder="Brand name" />
                              </div>
                              <div>
                                <label><Users size={14} /> Gender *</label>
                                <Field as="select" name="gender" className="cat-input">
                                  <option value="unisex">Unisex</option>
                                  <option value="men">Men</option>
                                  <option value="women">Women</option>
                                  <option value="kids">Kids</option>
                                </Field>
                              </div>
                              <div className="span-all">
                                <label><FileText size={14} /> Description</label>
                                <Field as="textarea" name="description" rows={3} className="cat-input" placeholder="Optional product description" />
                              </div>
                            </div>
                          </section>
                        )}

                        {section === 'attributes' && (
                          <section className="cat-form-section">
                            <div className="cat-section-head">
                              <h3>Section 2 · Product Attributes</h3>
                              <p>{garmentAttrs ? 'Garment attributes for this category' : 'Limited attributes for accessories'}</p>
                            </div>
                            <div className="cat-form-grid">
                              <div>
                                <label>Fabric Type</label>
                                <Field as="select" name="fabric" className="cat-input">
                                  <option value="">Select</option>
                                  {FABRIC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                </Field>
                              </div>
                              <div>
                                <label>Material</label>
                                <Field as="select" name="material" className="cat-input">
                                  <option value="">Select</option>
                                  {MATERIAL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                </Field>
                              </div>
                              {garmentAttrs && (
                                <>
                                  <div>
                                    <label>Pattern</label>
                                    <Field as="select" name="pattern" className="cat-input">
                                      <option value="">Select</option>
                                      {PATTERN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                    </Field>
                                  </div>
                                  <div>
                                    <label>Fit Type</label>
                                    <Field as="select" name="fit_type" className="cat-input">
                                      <option value="">Select</option>
                                      {FIT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                    </Field>
                                  </div>
                                  <div>
                                    <label>Sleeve Type</label>
                                    <Field as="select" name="sleeve_type" className="cat-input">
                                      <option value="">Select</option>
                                      {SLEEVE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                    </Field>
                                  </div>
                                  <div>
                                    <label>Neck Type</label>
                                    <Field as="select" name="neck_type" className="cat-input">
                                      <option value="">Select</option>
                                      {NECK_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                    </Field>
                                  </div>
                                </>
                              )}
                              <div>
                                <label>Occasion</label>
                                <Field as="select" name="occasion" className="cat-input">
                                  <option value="">Select</option>
                                  {OCCASION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                </Field>
                              </div>
                              <div>
                                <label>Season</label>
                                <Field as="select" name="season" className="cat-input">
                                  <option value="">Select</option>
                                  {SEASON_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                </Field>
                              </div>
                              <div>
                                <label>Country of Origin</label>
                                <Field name="country_of_origin" className="cat-input" placeholder="India" />
                              </div>
                            </div>
                          </section>
                        )}

                        {section === 'variants' && (
                          <section className="cat-form-section">
                            <div className="cat-section-head row">
                              <div>
                                <h3>Section 3 · Size & Colour Variants</h3>
                                <p>Each colour × size needs a unique SKU · stock qty is in Stock module</p>
                              </div>
                              <button
                                type="button"
                                className="cat-mini-btn"
                                onClick={() => {
                                  const next = [
                                    ...(values.variants || []),
                                    createVariant({ color: '', size: '' }, values.sku || draftCode),
                                  ];
                                  setFieldValue('variants', next);
                                }}
                              >
                                <Plus size={14} /> Add Variant
                              </button>
                            </div>
                            <FieldArray name="variants">
                              {({ remove }) => (
                                <div className="cat-variant-list">
                                  {(values.variants || []).map((variant: CatalogVariant, index: number) => (
                                    <div key={variant.key} className="cat-variant-row">
                                      <div>
                                        <label><Palette size={12} /> Colour</label>
                                        <select
                                          className="cat-input"
                                          value={variant.color}
                                          onChange={(e) => {
                                            const color = e.target.value;
                                            const stock_code = buildVariantSku(values.sku || draftCode, color, variant.size);
                                            const next = [...values.variants];
                                            next[index] = { ...variant, color, stock_code, barcode: stock_code };
                                            setFieldValue('variants', next);
                                          }}
                                        >
                                          <option value="">Select</option>
                                          {(COLOR_OPTIONS.includes(variant.color) || !variant.color
                                            ? COLOR_OPTIONS
                                            : [variant.color, ...COLOR_OPTIONS]
                                          ).map((c) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                      </div>
                                      <div>
                                        <label><Ruler size={12} /> Size</label>
                                        <select
                                          className="cat-input"
                                          value={variant.size}
                                          onChange={(e) => {
                                            const size = e.target.value;
                                            const stock_code = buildVariantSku(values.sku || draftCode, variant.color, size);
                                            const next = [...values.variants];
                                            next[index] = { ...variant, size, stock_code, barcode: stock_code };
                                            setFieldValue('variants', next);
                                          }}
                                        >
                                          <option value="">Select</option>
                                          {(SIZE_OPTIONS.includes(variant.size) || !variant.size
                                            ? SIZE_OPTIONS
                                            : [variant.size, ...SIZE_OPTIONS]
                                          ).map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                      </div>
                                      <div>
                                        <label>Variant SKU</label>
                                        <input className="cat-input" value={variant.stock_code} readOnly />
                                      </div>
                                      <div className="cat-variant-barcode">
                                        <label>Barcode</label>
                                        <div className="cat-barcode-row">
                                          <input
                                            className="cat-input"
                                            value={variant.barcode}
                                            onChange={(e) => {
                                              const next = [...values.variants];
                                              next[index] = { ...variant, barcode: e.target.value };
                                              setFieldValue('variants', next);
                                            }}
                                          />
                                          <button
                                            type="button"
                                            className="cat-mini-btn cat-barcode-download"
                                            title="Download this variant barcode"
                                            disabled={!String(variant.barcode || variant.stock_code || '').trim()}
                                            onClick={async () => {
                                              const code = String(variant.barcode || variant.stock_code || '').trim();
                                              if (!code) {
                                                toast.error('Barcode is empty');
                                                return;
                                              }
                                              try {
                                                await downloadBarcodePng(
                                                  code,
                                                  safeBarcodeFileName([
                                                    values.name || values.sku,
                                                    variant.color,
                                                    variant.size,
                                                    code,
                                                  ])
                                                );
                                                toast.success(`Barcode downloaded · ${variant.color || ''} ${variant.size || ''}`.trim());
                                              } catch (e: any) {
                                                toast.error(e?.message || 'Could not download barcode');
                                              }
                                            }}
                                          >
                                            <Download size={13} /> Download
                                          </button>
                                        </div>
                                      </div>
                                      <div>
                                        <label>Status</label>
                                        <select
                                          className="cat-input"
                                          value={variant.is_active ? '1' : '0'}
                                          onChange={(e) => {
                                            const next = [...values.variants];
                                            next[index] = { ...variant, is_active: e.target.value === '1' };
                                            setFieldValue('variants', next);
                                          }}
                                        >
                                          <option value="1">Active</option>
                                          <option value="0">Inactive</option>
                                        </select>
                                      </div>
                                      <div className="cat-variant-image">
                                        <label>Variant Image</label>
                                        <div className="cat-variant-image-row">
                                          <span className={`cat-thumb ${variant.image_url ? 'has-image' : ''}`}>
                                            {variant.image_url ? (
                                              <img src={variant.image_url} alt="" />
                                            ) : (
                                              <ImageIcon size={14} />
                                            )}
                                          </span>
                                          <button
                                            type="button"
                                            className="cat-mini-btn"
                                            disabled={uploading}
                                            onClick={() => {
                                              variantUploadTarget.current = { index, setFieldValue };
                                              variantFileRef.current?.click();
                                            }}
                                          >
                                            <Upload size={13} /> {variant.image_url ? 'Replace' : 'Upload'}
                                          </button>
                                          {variant.image_url && (
                                            <button
                                              type="button"
                                              className="cat-mini-btn ghost"
                                              title="Clear image"
                                              onClick={() => {
                                                const next = values.variants.map((v, i) =>
                                                  i === index ? { ...v, image_url: '' } : v
                                                );
                                                setFieldValue('variants', next);
                                              }}
                                            >
                                              <X size={13} />
                                            </button>
                                          )}
                                          {values.variants.length > 1 && (
                                            <button type="button" className="cat-mini-btn danger" title="Remove variant" onClick={() => remove(index)}>
                                              <Trash2 size={13} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </FieldArray>
                          </section>
                        )}

                        {section === 'pricing' && (
                          <section className="cat-form-section">
                            <div className="cat-section-head">
                              <h3>Section 4 · Pricing & Tax</h3>
                              <p>Catalog pricing only · purchase receipts stay in Purchase / GRN</p>
                            </div>
                            <div className="cat-price-tag-row">
                              <div className="cat-price-tag-copy">
                                <TagIcon size={16} />
                                <div>
                                  <strong>Price tags</strong>
                                  <p>Download or print tags for all colour/size variants with MRP & selling price</p>
                                </div>
                              </div>
                              <div className="cat-price-tag-actions">
                                <button
                                  type="button"
                                  className="cat-mini-btn"
                                  onClick={() => {
                                    if (!values.name?.trim()) {
                                      toast.error('Enter product name first');
                                      return;
                                    }
                                    if (values.price === '' || values.price == null) {
                                      toast.error('Enter MRP first');
                                      return;
                                    }
                                    const item = priceTagProductFromForm(values, user?.companyName);
                                    const rows = buildPriceTagRows(item);
                                    if (!rows.length) {
                                      toast.error('Add at least one size/colour variant');
                                      return;
                                    }
                                    downloadPriceTagsHtml(item, rows, values.sku || values.name, priceTagBrand);
                                    toast.success(`Downloaded ${rows.length} price tag${rows.length > 1 ? 's' : ''}`);
                                  }}
                                >
                                  <Download size={14} /> Download Price Tag
                                </button>
                                <button
                                  type="button"
                                  className="cat-mini-btn"
                                  onClick={() => {
                                    if (!values.name?.trim()) {
                                      toast.error('Enter product name first');
                                      return;
                                    }
                                    if (values.price === '' || values.price == null) {
                                      toast.error('Enter MRP first');
                                      return;
                                    }
                                    const item = priceTagProductFromForm(values, user?.companyName);
                                    const rows = buildPriceTagRows(item);
                                    if (!rows.length) {
                                      toast.error('Add at least one size/colour variant');
                                      return;
                                    }
                                    if (!printPriceTags(item, rows, priceTagBrand)) {
                                      toast.error('Allow popups to print price tags');
                                      return;
                                    }
                                    toast.success('Price tag print opened');
                                  }}
                                >
                                  <Printer size={14} /> Print
                                </button>
                              </div>
                            </div>
                            <div className="cat-form-grid">
                              <div>
                                <label>Purchase Price</label>
                                <Field name="purchase_price" type="number" className="cat-input" placeholder="Optional cost reference" />
                              </div>
                              <div>
                                <label>MRP *</label>
                                <Field
                                  name="price"
                                  type="number"
                                  className="cat-input"
                                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    const price = e.target.value;
                                    setFieldValue('price', price);
                                    setFieldValue(
                                      'sale_price',
                                      calcSalePrice(price, values.discount_type, values.discount_value)
                                    );
                                  }}
                                />
                                {touched.price && errors.price && <p className="cat-error">{String(errors.price)}</p>}
                              </div>
                              <div>
                                <label>Discount Type</label>
                                <Field
                                  as="select"
                                  name="discount_type"
                                  className="cat-input"
                                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                    const discount_type = e.target.value;
                                    setFieldValue('discount_type', discount_type);
                                    setFieldValue(
                                      'sale_price',
                                      calcSalePrice(values.price, discount_type, values.discount_value)
                                    );
                                  }}
                                >
                                  <option value="percent">Percent</option>
                                  <option value="fixed">Fixed</option>
                                </Field>
                              </div>
                              <div>
                                <label>Discount Value</label>
                                <Field
                                  name="discount_value"
                                  type="number"
                                  className="cat-input"
                                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    const discount_value = e.target.value;
                                    setFieldValue('discount_value', discount_value);
                                    setFieldValue(
                                      'sale_price',
                                      calcSalePrice(values.price, values.discount_type, discount_value)
                                    );
                                  }}
                                />
                              </div>
                              <div>
                                <label>Selling Price</label>
                                <Field name="sale_price" type="number" className="cat-input" />
                              </div>
                              <div>
                                <label>HSN Code</label>
                                <Field name="hsn_code" className="cat-input" placeholder="e.g. 6109" />
                              </div>
                              <div>
                                <label><Percent size={14} /> GST Rate %</label>
                                <Field name="gst_rate" type="number" className="cat-input" placeholder="5 / 12 / 18" />
                              </div>
                              <div>
                                <label>Tax Mode</label>
                                <Field as="select" name="tax_inclusive" className="cat-input"
                                  value={values.tax_inclusive ? '1' : '0'}
                                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                    setFieldValue('tax_inclusive', e.target.value === '1')
                                  }
                                >
                                  <option value="1">Tax Inclusive</option>
                                  <option value="0">Tax Exclusive</option>
                                </Field>
                              </div>
                            </div>
                          </section>
                        )}

                        {section === 'images' && (
                          <section className="cat-form-section">
                            <div className="cat-section-head">
                              <h3>Section 5 · Product Images</h3>
                              <p>Main image, gallery, and colour-wise images via variants</p>
                            </div>
                            <div className="cat-image-box">
                              <div className="cat-image-preview">
                                {values.image_url ? <img src={values.image_url} alt="Main" /> : (
                                  <div className="cat-image-empty"><ImageIcon size={28} /><span>Main product image</span></div>
                                )}
                                {uploading && <div className="cat-uploading">Uploading...</div>}
                              </div>
                              <div className="cat-image-actions">
                                <button type="button" className="cat-mini-btn" onClick={() => fileRef.current?.click()}><Upload size={14} /> Upload</button>
                                <button type="button" className="cat-mini-btn" onClick={() => cameraRef.current?.click()}><Camera size={14} /> Camera</button>
                                <button type="button" className="cat-mini-btn danger" onClick={() => setFieldValue('image_url', '')}><Trash2 size={14} /> Remove</button>
                              </div>
                              <Field name="image_url" className="cat-input" placeholder="Or paste main image URL" />
                            </div>

                            <div className="cat-gallery">
                              <div className="cat-section-head row">
                                <h4>Gallery Images</h4>
                                <button type="button" className="cat-mini-btn" onClick={() => galleryRef.current?.click()}>
                                  <Plus size={14} /> Add Gallery Image
                                </button>
                              </div>
                              <div className="cat-gallery-grid">
                                {gallery.length === 0 && <p className="cat-hint">No gallery images yet.</p>}
                                {gallery.map((url) => (
                                  <div key={url} className="cat-gallery-item">
                                    <img src={url} alt="" />
                                    <button type="button" onClick={() => setGallery((prev) => prev.filter((u) => u !== url))}>
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </section>
                        )}

                        {section === 'store' && (
                          <section className="cat-form-section">
                            <div className="cat-section-head">
                              <h3>Section 6 · Online Store Settings</h3>
                              <p>Visibility and SEO for the shopfront</p>
                            </div>
                            <div className="cat-checks">
                              <label><input type="checkbox" checked={!!values.publish_online} onChange={(e) => setFieldValue('publish_online', e.target.checked)} /> Publish Online</label>
                              <label><input type="checkbox" checked={!!values.is_featured} onChange={(e) => setFieldValue('is_featured', e.target.checked)} /> Featured Product</label>
                              <label><input type="checkbox" checked={!!values.is_new_arrival} onChange={(e) => setFieldValue('is_new_arrival', e.target.checked)} /> New Arrival</label>
                              <label><input type="checkbox" checked={!!values.is_best_seller} onChange={(e) => setFieldValue('is_best_seller', e.target.checked)} /> Best Seller</label>
                              <label><input type="checkbox" checked={!!values.is_active} onChange={(e) => setFieldValue('is_active', e.target.checked)} /> Active</label>
                            </div>
                            <div className="cat-form-grid">
                              <div>
                                <label>Product Visibility</label>
                                <Field as="select" name="visibility" className="cat-input">
                                  <option value="public">Public</option>
                                  <option value="hidden">Hidden</option>
                                  <option value="scheduled">Scheduled</option>
                                </Field>
                              </div>
                              <div>
                                <label>SEO Title</label>
                                <Field name="seo_title" className="cat-input" placeholder="Optional SEO title" />
                              </div>
                              <div className="span-all">
                                <label>SEO Description</label>
                                <Field as="textarea" name="seo_description" rows={3} className="cat-input" placeholder="Optional SEO description" />
                              </div>
                            </div>
                          </section>
                        )}
                      </div>

                      <div className="cat-oc-actions">
                        <button type="button" className="cat-btn ghost" onClick={closeForm}>Cancel</button>
                        <div className="cat-oc-nav">
                          {section !== 'basic' && (
                            <button
                              type="button"
                              className="cat-btn ghost"
                              onClick={() => {
                                const idx = SECTIONS.findIndex((s) => s.key === section);
                                if (idx > 0) setSection(SECTIONS[idx - 1].key);
                              }}
                            >
                              Previous
                            </button>
                          )}
                          {section !== 'store' ? (
                            <button
                              type="button"
                              className="cat-btn primary"
                              onClick={() => {
                                const idx = SECTIONS.findIndex((s) => s.key === section);
                                if (idx < SECTIONS.length - 1) setSection(SECTIONS[idx + 1].key);
                              }}
                            >
                              Next
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="cat-btn primary"
                              disabled={isSubmitting}
                              onClick={handleSaveClick}
                            >
                              {isSubmitting ? 'Saving...' : <><Save size={15} /> {editing ? 'Update Product' : 'Save Product'}</>}
                            </button>
                          )}
                        </div>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
