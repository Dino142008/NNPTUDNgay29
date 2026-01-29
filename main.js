let allProducts = [];
let filteredProducts = [];
let currentEditId = null;
let currentSort = 'default';
let currentPage = 1;
const itemsPerPage = 10;

// Load dữ liệu từ db.json
fetch("db.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("Không load được db.json");
    }
    return response.json();
  })
  .then(data => {
    allProducts = data;
    filteredProducts = [...allProducts];
    currentPage = 1;
    displayProductsWithPagination(filteredProducts);
    attachEventListeners();
  })
  .catch(error => {
    document.getElementById("productList").innerHTML = "<tr><td colspan='5' class='text-center text-danger'>Lỗi khi tải dữ liệu!</td></tr>";
    console.error(error);
  });

// Hiển thị sản phẩm trong bảng với phân trang
function displayProductsWithPagination(products) {
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  displayProducts(paginatedProducts);
  displayPagination(products.length, totalPages);

  // Cập nhật thông tin phân trang
  document.getElementById("itemStart").textContent = products.length === 0 ? 0 : startIndex + 1;
  document.getElementById("itemEnd").textContent = Math.min(endIndex, products.length);
  document.getElementById("totalItems").textContent = products.length;
}

// Hiển thị sản phẩm trong bảng
function displayProducts(products) {
  const list = document.getElementById("productList");
  
  if (products.length === 0) {
    list.innerHTML = "<tr><td colspan='5' class='text-center'>Không có sản phẩm nào</td></tr>";
    return;
  }

  list.innerHTML = products.map((item, index) => `
    <tr class="row-hover">
      <td><img src="${item.images[0]}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;"></td>
      <td>
        <span>${item.title}</span>
        <div class="description-tooltip">${item.description}</div>
      </td>
      <td>${item.category.name}</td>
      <td class="price-cell">$${item.price}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-warning btn-sm" onclick="openEditModal('${item.id}')"><i class="fas fa-edit"></i> Sửa</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct('${item.id}')"><i class="fas fa-trash"></i> Xóa</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// Hiển thị phân trang
function displayPagination(totalItems, totalPages) {
  const paginationList = document.getElementById("paginationList");
  paginationList.innerHTML = "";

  if (totalPages <= 1) return;

  // Nút Previous
  const prevItem = document.createElement("li");
  prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevItem.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i> Trước</a>`;
  paginationList.appendChild(prevItem);

  // Các nút số trang
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
    pageItem.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>`;
    paginationList.appendChild(pageItem);
  }

  // Nút Next
  const nextItem = document.createElement("li");
  nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  nextItem.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${currentPage + 1})">Tiếp <i class="fas fa-chevron-right"></i></a>`;
  paginationList.appendChild(nextItem);
}

// Chuyển đến trang
function goToPage(page) {
  event.preventDefault();
  currentPage = page;
  displayProductsWithPagination(filteredProducts);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Tìm kiếm sản phẩm
function searchProduct(searchText) {
  const text = searchText.toLowerCase().trim();
  if (text === "") {
    filteredProducts = [...allProducts];
  } else {
    filteredProducts = allProducts.filter(item => 
      item.title.toLowerCase().includes(text)
    );
  }
  currentPage = 1;
  applySortAndDisplay();
}

// Áp dụng sắp xếp và hiển thị
function applySortAndDisplay() {
  if (currentSort === 'nameAsc') {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  } else if (currentSort === 'nameDesc') {
    filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
  } else if (currentSort === 'priceAsc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'priceDesc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }
  displayProductsWithPagination(filteredProducts);
}

// Thiết lập sắp xếp và hiển thị
function setSortAndDisplay(sortType, sortTitle) {
  event.preventDefault();
  currentSort = sortType;
  currentPage = 1;
  document.getElementById("sortTitle").textContent = sortTitle;
  applySortAndDisplay();
}

// Xóa sản phẩm
function deleteProduct(productId) {
  if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
    const allIndex = allProducts.findIndex(p => p.id === productId);
    if (allIndex > -1) {
      allProducts.splice(allIndex, 1);
    }
    filteredProducts = filteredProducts.filter(p => p.id !== productId);
    
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage > totalPages && currentPage > 1) {
      currentPage--;
    }
    displayProductsWithPagination(filteredProducts);
  }
}

// Mở modal sửa
function openEditModal(productId) {
  const product = filteredProducts.find(p => p.id === productId);
  if (!product) return;
  
  currentEditId = productId;
  
  document.getElementById("editTitle").value = product.title;
  document.getElementById("editPrice").value = product.price;
  document.getElementById("editDescription").value = product.description;
  
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();
}

// Lưu thay đổi sản phẩm
function saveEdit() {
  if (currentEditId !== null) {
    const product = filteredProducts.find(p => p.id === currentEditId);
    if (!product) return;
    
    product.title = document.getElementById("editTitle").value;
    product.price = parseFloat(document.getElementById("editPrice").value);
    product.description = document.getElementById("editDescription").value;
    
    // Cập nhật trong allProducts
    const allIndex = allProducts.findIndex(p => p.id === currentEditId);
    if (allIndex > -1) {
      allProducts[allIndex] = product;
    }
    
    displayProductsWithPagination(filteredProducts);
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
    currentEditId = null;
  }
}

// Gắn event listeners
function attachEventListeners() {
  // Tìm kiếm
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchProduct(e.target.value);
  });

  // Lưu sửa
  document.getElementById("saveEditBtn").addEventListener("click", saveEdit);
}
