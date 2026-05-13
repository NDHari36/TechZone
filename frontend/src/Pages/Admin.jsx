// import React, { useEffect, useState } from 'react';

// const getAuthToken = () => localStorage.getItem('authToken') || '';

// function Admin() {
//   const [me, setMe] = useState(null);
//   const [loadingMe, setLoadingMe] = useState(true);
//   const [tab, setTab] = useState('users');

//   // Users state
//   const [users, setUsers] = useState([]);
//   const [userForm, setUserForm] = useState({ username: '', fullName: '', password: '', phone: '', email: '' });
//   const [userSearch, setUserSearch] = useState('');
//   const [userRoleEdit, setUserRoleEdit] = useState({});
//   const [usersLoading, setUsersLoading] = useState(false);

//   // Products state
//   const [products, setProducts] = useState([]);
//   const [productForm, setProductForm] = useState({
//     name: '',
//     color: '',
//     storage: '',
//     price: '',
//     description: '',
//     isActive: true,
//     brandId: '',
//     categoryId: '',
//     stock: '',
//     specs: [{ name: '', value: '' }],
//     images: [{ primary: true, sortOrder: 1 }]
//   });
//   const [productFile, setProductFile] = useState([]);
//   const [productsLoading, setProductsLoading] = useState(false);

//   // Orders state
//   const [adminOrders, setAdminOrders] = useState([]);
//   const [ordersLoading, setOrdersLoading] = useState(false);

//   // Vouchers state
//   const [voucherForm, setVoucherForm] = useState({ code: '', discountAmount: 0, quantity: 1, expirationDate: '' });

//   useEffect(() => {
//     const fetchMe = async () => {
//       setLoadingMe(true);
//       try {
//         const token = getAuthToken();
//         const res = await fetch('http://localhost:8081/api/users/me', {
//           headers: { Authorization: token ? `Bearer ${token}` : '' },
//           credentials: 'include'
//         });
//         if (!res.ok) throw new Error('Unauthorized');
//         const data = await res.json();
//         setMe(data.result || data);
//       } catch (err) {
//         setMe(null);
//       } finally {
//         setLoadingMe(false);
//       }
//     };
//     fetchMe();
//   }, []);

//   // --- Users actions ---
//   const fetchUsers = async () => {
//     setUsersLoading(true);
//     try {
//       const token = getAuthToken();
//       const res = await fetch('http://localhost:8081/api/users', {
//         headers: { Authorization: token ? `Bearer ${token}` : '' },
//         credentials: 'include'
//       });
//       if (!res.ok) throw new Error('Failed fetch users');
//       const data = await res.json();
//       setUsers(data.result || data || []);
//     } catch (err) {
//       console.error(err);
//       setUsers([]);
//     }
//     setUsersLoading(false);
//   };

//   const searchUsers = async (keyword) => {
//     setUsersLoading(true);
//     try {
//       const token = getAuthToken();
//       const res = await fetch('http://localhost:8081/api/users/search', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//         credentials: 'include',
//         body: JSON.stringify(keyword ? { keyword } : {})
//       });
//       if (!res.ok) throw new Error(`Search failed ${res.status}`);
//       const data = await res.json();
//       const list = data.result || data || [];
//       setUsers(Array.isArray(list) ? list : (list.content || []));
//     } catch (err) {
//       console.error('searchUsers error', err);
//       alert('Tìm user lỗi: ' + err.message);
//     }
//     setUsersLoading(false);
//   };

//   const changeUserRole = async (userId, roleType) => {
//     try {
//       if (!confirm(`Đổi vai trò của user ${userId} sang ${roleType}?`)) return;
//       const token = getAuthToken();
//       const res = await fetch(`http://localhost:8081/api/users/${userId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//         credentials: 'include',
//         body: JSON.stringify({ roleType })
//       });
//       const text = await res.text();
//       if (!res.ok) throw new Error(text || `Status ${res.status}`);
//       alert('Cập nhật vai trò thành công');
//       await fetchUsers();
//     } catch (err) {
//       alert('Cập nhật vai trò lỗi: ' + err.message);
//     }
//   };

//   const createUser = async () => {
//     try {
//       const token = getAuthToken();
//       const res = await fetch('http://localhost:8081/api/users', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//         credentials: 'include',
//         body: JSON.stringify(userForm)
//       });
//       if (!res.ok) throw new Error('Create user failed');
//       await fetchUsers();
//       setUserForm({ username: '', fullName: '', password: '', phone: '', email: '' });
//       alert('Người dùng đã được tạo');
//     } catch (err) {
//       alert('Tạo user lỗi: ' + err.message);
//     }
//   };

//   const deleteUser = async (id) => {
//     if (!confirm('Xóa người dùng này?')) return;
//     try {
//       const token = getAuthToken();
//       const res = await fetch(`http://localhost:8081/api/users/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: token ? `Bearer ${token}` : '' },
//         credentials: 'include'
//       });
//       if (!res.ok) throw new Error('Delete failed');
//       await fetchUsers();
//     } catch (err) {
//       alert('Xóa thất bại: ' + err.message);
//     }
//   };

//   // --- Products ---
//   const fetchProducts = async () => {
//     setProductsLoading(true);
//     try {
//       const token = getAuthToken();
//       const res = await fetch('http://localhost:8081/api/products', { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, credentials: 'include' });
//       if (!res.ok) throw new Error('Fetch products failed');
//       const data = await res.json();
//       setProducts(data.result?.content || data.result || data || []);
//     } catch (err) {
//       console.error(err);
//       setProducts([]);
//     }
//     setProductsLoading(false);
//   };

//   const createProduct = async () => {
//     try {
//       const token = getAuthToken();
//       const fd = new FormData();
//       // Build product object with ONLY the fields the API expects
//       const productObj = {
//         name: productForm.name,
//         color: productForm.color,
//         storage: productForm.storage,
//         price: Number(productForm.price),
//         description: productForm.description,
//         isActive: !!productForm.isActive,
//         brandId: Number(productForm.brandId) || 1,
//         categoryId: Number(productForm.categoryId) || 1,
//         stock: productForm.stock,
//         specs: Array.isArray(productForm.specs) ? productForm.specs.map(s => ({ name: s.name, value: s.value })) : [],
//         images: Array.isArray(productForm.images) ? productForm.images.map(img => ({ primary: !!img.primary, sortOrder: Number(img.sortOrder) || 0 })) : []
//       };
//       // Append product as JSON string (form-data text field) to match Postman example
//       fd.append('product', JSON.stringify(productObj));
//       // append files (support multiple) under 'files' key
//       if (productFile && productFile.length) {
//         productFile.forEach(f => fd.append('files', f));
//       }
//       const res = await fetch('http://localhost:8081/api/products', {
//         method: 'POST',
//         headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//         credentials: 'include',
//         body: fd
//       });
//       if (!res.ok) {
//         // try to parse response body for helpful message
//         const ct = res.headers.get('content-type') || '';
//         let body = '';
//         try {
//           body = ct.includes('application/json') ? JSON.stringify(await res.json()) : await res.text();
//         } catch (e) { body = await res.text().catch(()=>'<no body>'); }
//         throw new Error(`Create product failed: ${res.status} ${body}`);
//       }
//       await fetchProducts();
//       setProductForm({ name: '', price: '', brandId: '', categoryId: '', description: '', stock: '' });
//       setProductFile(null);
//       alert('Sản phẩm tạo thành công');
//     } catch (err) {
//       alert('Tạo sản phẩm lỗi: ' + err.message);
//       console.error('createProduct error', err);
//     }
//   };

//   const deleteProduct = async (id) => {
//     if (!confirm('Xóa sản phẩm?')) return;
//     try {
//       const token = getAuthToken();
//       const res = await fetch(`http://localhost:8081/api/products/${id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' }, credentials: 'include' });
//       if (!res.ok) throw new Error('Delete product failed');
//       await fetchProducts();
//     } catch (err) { alert('Xóa thất bại: ' + err.message); }
//   };

//   // --- Admin Orders ---
//   const fetchAdminOrders = async () => {
//     setOrdersLoading(true);
//     try {
//       const token = getAuthToken();
//       const res = await fetch('http://localhost:8081/api/admin/orders', {
//         headers: { Authorization: token ? `Bearer ${token}` : '' },
//         credentials: 'include'
//       });
//       if (!res.ok) throw new Error('Fetch admin orders failed');
//       const data = await res.json();
//       setAdminOrders(data.result || data || []);
//     } catch (err) {
//       console.error(err);
//       setAdminOrders([]);
//     }
//     setOrdersLoading(false);
//   };

//   const setOrderStatus = async (orderId, status) => {
//     try {
//       const token = getAuthToken();
//       const res = await fetch(`http://localhost:8081/api/admin/orders/${orderId}/status?status=${encodeURIComponent(status)}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'text/plain', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//         credentials: 'include'
//       });
//       if (!res.ok) throw new Error('Update status failed');
//       await fetchAdminOrders();
//     } catch (err) { alert('Cập nhật trạng thái thất bại: ' + err.message); }
//   };

//   // --- Vouchers ---
//   const createVoucher = async () => {
//     try {
//       const token = getAuthToken();
//       const res = await fetch('http://localhost:8081/api/admin/vouchers', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//         credentials: 'include',
//         body: JSON.stringify(voucherForm)
//       });
//       if (!res.ok) throw new Error('Create voucher failed');
//       alert('Voucher đã tạo');
//     } catch (err) { alert('Tạo voucher lỗi: ' + err.message); }
//   };

//   // Load lists when switching tabs
//   useEffect(() => {
//     if (!me) return;
//     if (tab === 'users') fetchUsers();
//     if (tab === 'products') fetchProducts();
//     if (tab === 'orders') fetchAdminOrders();
//   }, [tab, me]);

//   if (loadingMe) return <div className="p-6">Đang kiểm tra quyền...</div>;
//   if (!me) return <div className="p-6 text-red-600">Bạn chưa đăng nhập hoặc không có quyền truy cập.</div>;
//   // Normalize role list from different possible response shapes (roleTypes, roleType, role, roles)
//   const rolesArr = Array.isArray(me.roleTypes)
//     ? me.roleTypes
//     : me.roleType
//     ? [me.roleType]
//     : me.role
//     ? [me.role]
//     : Array.isArray(me.roles)
//     ? me.roles
//     : [];
//   const isAdmin = rolesArr.includes('ADMIN');
//   const rolesDisplay = rolesArr.join(', ');
//   if (!isAdmin) return <div className="p-6">Bạn không có quyền ADMIN. Vai trò hiện tại: {rolesDisplay || 'NONE'}</div>;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="flex gap-6">
//           <aside className="w-64 bg-white border rounded-lg p-4 shadow-sm">
//             <div className="text-lg font-semibold mb-4">Admin</div>
//             <div className="space-y-2">
//               <button onClick={() => setTab('users')} className={`w-full text-left px-3 py-2 rounded ${tab==='users' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Users</button>
//               <button onClick={() => setTab('products')} className={`w-full text-left px-3 py-2 rounded ${tab==='products' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Products</button>
//               <button onClick={() => setTab('orders')} className={`w-full text-left px-3 py-2 rounded ${tab==='orders' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Orders</button>
//               <button onClick={() => setTab('vouchers')} className={`w-full text-left px-3 py-2 rounded ${tab==='vouchers' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Vouchers</button>
//               <button onClick={()=>{ setTab('users'); fetchUsers(); }} className="w-full text-left px-3 py-2 rounded text-sm text-gray-500">Refresh users</button>
//             </div>
//             <div className="mt-6 text-sm text-gray-500">Bạn: {me.fullName || me.username}</div>
//             <div className="mt-1 text-xs text-gray-400">Roles: {rolesDisplay || '—'}</div>
//           </aside>

//           <main className="flex-1">
//             <div className="bg-white border rounded-lg p-6 shadow-sm">
//               <div className="flex items-center justify-between mb-4">
//                 <h1 className="text-2xl font-bold">{tab === 'users' ? 'Quản lý người dùng' : tab === 'products' ? 'Quản lý sản phẩm' : tab === 'orders' ? 'Quản lý đơn hàng' : 'Voucher'}</h1>
//                 <div className="text-sm text-gray-500">Admin panel</div>
//               </div>

//               {tab==='users' && (
//                 <section>
//                   <div className="mb-4 flex items-start gap-4">
//                     <div className="flex gap-2">
//                       <input placeholder="Tìm user" value={userSearch} onChange={e=>setUserSearch(e.target.value)} className="px-3 py-2 border rounded w-72" />
//                       <button onClick={()=>searchUsers(userSearch)} className="px-4 py-2 bg-blue-600 text-white rounded">Tìm</button>
//                       <button onClick={fetchUsers} className="px-4 py-2 bg-gray-200 rounded">Tải lại</button>
//                     </div>
//                     <div className="ml-auto">
//                       <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
//                         <input placeholder="username" value={userForm.username} onChange={e=>setUserForm({...userForm, username:e.target.value})} className="px-3 py-2 border rounded" />
//                         <input placeholder="fullName" value={userForm.fullName} onChange={e=>setUserForm({...userForm, fullName:e.target.value})} className="px-3 py-2 border rounded" />
//                         <input placeholder="phone" value={userForm.phone} onChange={e=>setUserForm({...userForm, phone:e.target.value})} className="px-3 py-2 border rounded" />
//                         <input placeholder="email" value={userForm.email} onChange={e=>setUserForm({...userForm, email:e.target.value})} className="px-3 py-2 border rounded" />
//                       </div>
//                       <div className="mt-2"><button onClick={createUser} className="px-4 py-2 bg-gray-900 text-white rounded">Tạo user</button></div>
//                     </div>
//                   </div>

//                   <div className="border rounded">
//                     <table className="min-w-full">
//                       <thead className="bg-gray-50 text-sm text-gray-600">
//                         <tr>
//                           <th className="px-4 py-3">#</th>
//                           <th className="px-4 py-3">Username</th>
//                           <th className="px-4 py-3">Full name</th>
//                           <th className="px-4 py-3">Email</th>
//                           <th className="px-4 py-3">Phone</th>
//                           <th className="px-4 py-3">Roles</th>
//                           <th className="px-4 py-3">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {usersLoading ? (
//                           <tr><td colSpan={7} className="p-6 text-center text-gray-500">Đang tải người dùng...</td></tr>
//                         ) : users.length === 0 ? (
//                           <tr><td colSpan={7} className="p-6 text-center text-gray-500">Không có dữ liệu</td></tr>
//                         ) : users.map((u, idx) => (
//                           <tr key={u.id || u.userId} className="border-t hover:bg-gray-50">
//                             <td className="px-4 py-3 align-top">{idx+1}</td>
//                             <td className="px-4 py-3 align-top">{u.username || u.email}</td>
//                             <td className="px-4 py-3 align-top">{u.fullName || ''}</td>
//                             <td className="px-4 py-3 align-top">{u.email || ''}</td>
//                             <td className="px-4 py-3 align-top">{u.phone || ''}</td>
//                             <td className="px-4 py-3 align-top">{(u.roleTypes && u.roleTypes.join(', ')) || u.roleType || (u.roles && u.roles.join(', ')) || ''}</td>
//                             <td className="px-4 py-3 align-top">
//                               <div className="flex items-center gap-2">
//                                 <select value={userRoleEdit[u.id || u.userId] || (u.roleType || (u.roleTypes && u.roleTypes[0]) || '')} onChange={e=>setUserRoleEdit({...userRoleEdit, [u.id || u.userId]: e.target.value})} className="px-2 py-1 border rounded">
//                                   <option value="USER">USER</option>
//                                   <option value="ADMIN">ADMIN</option>
//                                   <option value="OWNER">OWNER</option>
//                                 </select>
//                                 <button onClick={()=>changeUserRole(u.id || u.userId, userRoleEdit[u.id || u.userId] || (u.roleType || (u.roleTypes && u.roleTypes[0]) || 'USER'))} className="px-3 py-1 bg-yellow-500 text-white rounded">Cập nhật</button>
//                                 <button onClick={()=>deleteUser(u.id || u.userId)} className="px-3 py-1 bg-red-600 text-white rounded">Xóa</button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </section>
//               )}

//               {tab==='products' && (
//                 <section>
//                   <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
//                     <input placeholder="Tên" value={productForm.name} onChange={e=>setProductForm({...productForm, name:e.target.value})} className="px-3 py-2 border rounded" />
//                     <input placeholder="Giá" value={productForm.price} onChange={e=>setProductForm({...productForm, price:e.target.value})} className="px-3 py-2 border rounded" />
//                     <input placeholder="BrandId" value={productForm.brandId} onChange={e=>setProductForm({...productForm, brandId:e.target.value})} className="px-3 py-2 border rounded" />
//                     <input placeholder="CategoryId" value={productForm.categoryId} onChange={e=>setProductForm({...productForm, categoryId:e.target.value})} className="px-3 py-2 border rounded" />
//                     <input placeholder="Stock" value={productForm.stock} onChange={e=>setProductForm({...productForm, stock:e.target.value})} className="px-3 py-2 border rounded" />
//                     <input type="file" multiple onChange={e=>setProductFile(Array.from(e.target.files||[]))} className="px-3 py-2" />
//                     <input placeholder="Màu sắc" value={productForm.color} onChange={e=>setProductForm({...productForm, color: e.target.value})} className="px-3 py-2 border rounded" />
//                     <input placeholder="Bộ nhớ" value={productForm.storage} onChange={e=>setProductForm({...productForm, storage: e.target.value})} className="px-3 py-2 border rounded" />
//                     <label className="flex items-center gap-2 px-3 py-2">
//                       <input type="checkbox" checked={!!productForm.isActive} onChange={e=>setProductForm({...productForm, isActive: e.target.checked})} /> Active
//                     </label>
//                     <textarea placeholder="Mô tả" value={productForm.description} onChange={e=>setProductForm({...productForm, description:e.target.value})} className="col-span-1 md:col-span-3 p-2 border rounded" />
//                     <div className="col-span-1 md:col-span-3">
//                       <div className="mb-2 font-medium">Specs</div>
//                       {productForm.specs.map((s, i) => (
//                         <div key={i} className="flex gap-2 mb-2">
//                           <input placeholder="Tên spec" value={s.name} onChange={e=>{
//                             const specs = [...productForm.specs]; specs[i] = {...specs[i], name: e.target.value}; setProductForm({...productForm, specs});
//                           }} className="px-3 py-2 border rounded flex-1" />
//                           <input placeholder="Giá trị" value={s.value} onChange={e=>{
//                             const specs = [...productForm.specs]; specs[i] = {...specs[i], value: e.target.value}; setProductForm({...productForm, specs});
//                           }} className="px-3 py-2 border rounded flex-1" />
//                           <button onClick={()=>{ const specs = productForm.specs.filter((_,idx)=>idx!==i); setProductForm({...productForm, specs}); }} className="px-3 py-1 bg-red-600 text-white rounded">Xóa</button>
//                         </div>
//                       ))}
//                       <button onClick={()=>setProductForm({...productForm, specs: [...productForm.specs, {name:'', value:''}]})} className="px-3 py-1 bg-blue-600 text-white rounded">Thêm spec</button>
//                     </div>
//                     <div className="col-span-1 md:col-span-3 mt-3">
//                       <div className="mb-2 font-medium">Image metadata</div>
//                       {productForm.images.map((img, i) => (
//                         <div key={i} className="flex items-center gap-2 mb-2">
//                           <label className="flex items-center gap-2"><input type="checkbox" checked={!!img.primary} onChange={e=>{ const images = [...productForm.images]; images[i] = {...images[i], primary: e.target.checked}; setProductForm({...productForm, images}); }} /> Primary</label>
//                           <input type="number" value={img.sortOrder} onChange={e=>{ const images = [...productForm.images]; images[i] = {...images[i], sortOrder: Number(e.target.value)}; setProductForm({...productForm, images}); }} className="px-2 py-1 border rounded w-28" />
//                           <button onClick={()=>{ const images = productForm.images.filter((_,idx)=>idx!==i); setProductForm({...productForm, images}); }} className="px-3 py-1 bg-red-600 text-white rounded">Xóa</button>
//                         </div>
//                       ))}
//                       <button onClick={()=>setProductForm({...productForm, images: [...productForm.images, { primary: false, sortOrder: productForm.images.length+1 }]})} className="px-3 py-1 bg-blue-600 text-white rounded">Thêm image metadata</button>
//                     </div>
//                     <div className="col-span-1 md:col-span-3"><button onClick={createProduct} className="px-4 py-2 bg-gray-900 text-white rounded">Tạo sản phẩm</button></div>
//                   </div>

//                     <div>
//                       {productsLoading ? (
//                         <div className="p-6 text-center text-gray-500">Đang tải sản phẩm...</div>
//                       ) : products.length === 0 ? (
//                         <div className="p-6 text-center text-gray-500">Không có sản phẩm</div>
//                       ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                           {products.map(p => (
//                             <div key={p.id || p.productId} className="p-3 border rounded flex justify-between items-center">
//                               <div>
//                                 <div className="font-semibold">{p.name}</div>
//                                 <div className="text-sm text-gray-600">{p.brandName || p.brand || ''} — {p.price}</div>
//                               </div>
//                               <div className="flex gap-2">
//                                 <button onClick={()=>deleteProduct(p.id || p.productId)} className="px-3 py-1 bg-red-600 text-white rounded">Xóa</button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                 </section>
//               )}

//               {tab==='orders' && (
//                 <section>
//                   {ordersLoading ? <div className="p-6 text-center">Đang tải đơn hàng...</div> : (
//                     <div className="space-y-2">
//                       {adminOrders.map(o => (
//                         <div key={o.id || o.orderId} className="p-3 border rounded flex justify-between items-center">
//                           <div>
//                             <div className="font-semibold">{o.code || `#${o.id || o.orderId}`}</div>
//                             <div className="text-sm text-gray-600">Trạng thái: {o.status || o.orderStatus || ''}</div>
//                           </div>
//                           <div className="flex gap-2">
//                             <button onClick={()=>setOrderStatus(o.id || o.orderId, 'DELIVERED')} className="px-3 py-1 bg-green-600 text-white rounded">Giao</button>
//                             <button onClick={()=>setOrderStatus(o.id || o.orderId, 'CANCELLED')} className="px-3 py-1 bg-red-600 text-white rounded">Hủy</button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </section>
//               )}

//               {tab==='vouchers' && (
//                 <section>
//                   <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
//                     <input placeholder="Code" value={voucherForm.code} onChange={e=>setVoucherForm({...voucherForm, code:e.target.value})} className="px-3 py-2 border rounded" />
//                     <input placeholder="Discount" value={voucherForm.discountAmount} onChange={e=>setVoucherForm({...voucherForm, discountAmount:Number(e.target.value)})} className="px-3 py-2 border rounded" />
//                     <input placeholder="Quantity" value={voucherForm.quantity} onChange={e=>setVoucherForm({...voucherForm, quantity:Number(e.target.value)})} className="px-3 py-2 border rounded" />
//                     <input placeholder="Expiration (YYYY-MM-DD)" value={voucherForm.expirationDate} onChange={e=>setVoucherForm({...voucherForm, expirationDate:e.target.value})} className="px-3 py-2 border rounded" />
//                   </div>
//                   <div><button onClick={createVoucher} className="px-4 py-2 bg-gray-900 text-white rounded">Tạo voucher</button></div>
//                 </section>
//               )}
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }
