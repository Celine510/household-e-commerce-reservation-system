const apiPath = 'celine510';
const apiUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}`;
let productList = []; // 產品列表
let cartList = []; // 購物車列表

// 抓所有商品清單
const productWrap = document.querySelector('.productWrap');
function getProductList(){
  // * 商品id要寫進去
  axios.get(`${apiUrl}/products`)
    .then(response => {
      // console.log(response);
      productList = response.data.products;
      renderProductList(productList);
      getProductSelectCategory();
    })
    .catch(err => {
      // console.log(err);
    })
};

// 將商品清單渲染到畫面
function renderProductList(list){
  let res = list.map(item => {
    // 處理金錢格式
    const originPrice = new Intl.NumberFormat().format(item.origin_price);
    const nowPrice = new Intl.NumberFormat().format(item.price);
    return `<li class="productCard">
          <h4 class="productType">新品</h4>
          <img
            src="${item.images}"
            alt="">
          <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">NT$${originPrice}</del>
          <p class="nowPrice">NT$${nowPrice}</p>
        </li>`
  }).join('');
  productWrap.innerHTML = res;
};

// 條列商品種類
const productSelect = document.querySelector('.productSelect');
function getProductSelectCategory(){
  let categories = productList.map(item => {
    return item.category
  })
  
  const categoryList = categories.filter((item, index) => {
    return categories.indexOf(item) === index;
  })
  let str = `<option value="全部" selected>全部</option>`;
  categoryList.forEach(item => {
    str += `<option value="${item}">${item}</option>`
  })
  productSelect.innerHTML = str;
};

// 商品種類篩選
productSelect.addEventListener('change',e => {
  if(e.target.value === '全部'){
    getProductList();
    return
  };
  const resList = productList.filter(item => {
    return item.category === e.target.value;
  });
  renderProductList(resList);
});

// 加入購物車
productWrap.addEventListener('click',e => {
  e.preventDefault();
  if(e.target.text !== '加入購物車')return

  // 計算購物車產品數量
  let quantity = 1;
  cartList.forEach(item => {
    if (e.target.getAttribute('data-id') === item.product.id ){
      quantity += item.quantity;
    }
  });

  axios.post(`${apiUrl}/carts`, {
    "data": {
      "productId": e.target.getAttribute('data-id'),
      "quantity": quantity
      }
    })
    .then(response => {
      // console.log(response);
      getCartList();
    })
    .catch(err => {
      // console.log(err);
    })
});

// 取得購物車列表
const shoppingCartTable = document.querySelector('.shoppingCart-table');
function getCartList(){
  axios.get(`${apiUrl}/carts`)
    .then(response => {
      // console.log(response);
      cartList = response.data.carts;
      renderCartList(cartList);
    })
    .catch(err => {
      // console.log(err);
    })
};

// 購物車列表渲染到畫面上
function renderCartList(list){
  let str = `<tr>
            <th width="40%">品項</th>
            <th width="15%">單價</th>
            <th width="15%">數量</th>
            <th width="15%">金額</th>
            <th width="15%"></th>
            </tr>`
  // 總額計算
  let sumPrice = 0;
  // 購物車顯示
  list.forEach(item => {
    // 計算相同產品的總額
    const perProductPriceSum = item.product.price*1 * item.quantity;
    sumPrice += perProductPriceSum;
    str += `<tr>
              <td>
                <div class="cardItem-title">
                  <img src="${item.product.images}" alt="">
                  <p>${item.product.title}</p>
                </div> 
              </td>
              <td>NT$${new Intl.NumberFormat().format(item.product.price * 1) }</td>
              <td>${item.quantity}</td>
              <td>NT$${new Intl.NumberFormat().format(perProductPriceSum) }</td>
              <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}">
                  clear
                </a>
              </td>
            </tr>`
  });

  // 加上最後一行
  str += `<tr>
            <td>
              <a href="#" class="discardAllBtn">刪除所有品項</a>
            </td>
            <td></td>
            <td></td>
            <td>
            <p>總金額</p>
            </td>
            <td>NT$${new Intl.NumberFormat().format(sumPrice) }</td>
          </tr>`;
  shoppingCartTable.innerHTML = str;
    
  // (我的購物車)刪除所有
  const discardAllBtn = document.querySelector('.discardAllBtn');
  discardAllBtn.addEventListener('click',e => {
    e.preventDefault();
    axios.delete(`${apiUrl}/carts`)
      .then(response => {
        // console.log(response);
        getCartList();
      })
      .catch(err => {
        // console.log(err);
      })
  })
  // (我的購物車)各別刪除
  shoppingCartTable.addEventListener('click',e=>{
    e.preventDefault();
    if(e.target.innerText !== 'clear')return
    const id = e.target.getAttribute('data-id');
    axios.delete(`${apiUrl}/carts/${id}`)
      .then(response => {
        // console.log(response);
        getCartList();
      })
      .catch(err => {
        // console.log(err);
      })
  })
};

// (表單)送出購買訂單 && 表單驗證validate.js
const orderInfoForm = document.querySelector('.orderInfo-form');
orderInfoForm.addEventListener('submit',e => {
  e.preventDefault();

  // 表單驗證
  // 驗證限制條件
  const constraints = {
    customerName: {
      presence: true
    },
    customerPhone: {
      presence: true,
      length: {
        is: 10,
        message: "must be at 10 numbers :)"
      }
    },
    customerEmail: {
      presence: true,
      email: true
    },
    customerAddress: {
      presence: true
    }
  };
  // 回傳錯誤
  const errors = validate(orderInfoForm, constraints);
  // 取得輸入內容
  const inputs = document.querySelectorAll('input[type=text],input[type=tel],input[type=email]');
  
  inputs.forEach(item => {
    // 清空錯誤提示
    item.nextElementSibling.textContent = '';
    // 呈現錯誤提示
    if(errors){
      Object.keys(errors).forEach(key => {
        document.querySelector(`p[data-message=${key}]`).textContent = errors[key];
      })
    };
  });

  // 驗證未通過，不送出訂單
  if (errors)return;
  
  // 訂單指定格式
  const data = {
    "data": {
      "user": {
        "name": customerName.value,
        "tel": customerPhone.value,
        "email": customerEmail.value,
        "address": customerAddress.value,
        "payment": payMethod.value,
      }
    }
  };

  // 送出購買訂單
  axios.post(`${apiUrl}/orders`,data)
    .then(response => {
      Swal.fire('訂單已送出');
      getCartList();
      orderInfoForm.reset();
    })
    .catch(err => {
      // console.log(err);
    })
});

// 初始化-抓商品清單，抓購物車內容
function init(){
  getProductList();
  getCartList();
};
init();