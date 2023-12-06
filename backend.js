// *後台
// 1. 抓訂單資料
// 2. 刪除訂單
// 3. 刪除全部訂單
// 4. (圖表)顯示全產品類別營收比重，類別含三項，共有：床架、收納、窗簾
// 5. (圖表)顯示全品項營收比重，類別含四項，篩選出前三名營收品項，其他 4~8 名都統整為「其它」

const apiPath = 'celine510';
const apiUrl = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}`;
const token = 'Ph0fWA7kwJWpDtlQndQ2ApFhJaX2';
let orderList = []; // 訂單列表

// 取得訂單列表
function getOrderList(){
  axios.get(`${apiUrl}/orders`,{
    headers: {
      'authorization': token
    }
  })
    .then(response => {
      // console.log(response);
      orderList = response.data.orders;
      renderOrderList(orderList);
      getCategoryRevenueChart(orderList);
      getProductRevenueChart(orderList);
    })
    .catch(err => {
      console.log(err);
    })
}

// 訂單渲染到畫面上
const orderPageTable = document.querySelector('.orderPage-table');
function renderOrderList(orderList){
  let str = `<thead>
          <tr>
            <th>訂單編號</th>
            <th>聯絡人</th>
            <th>聯絡地址</th>
            <th>電子郵件</th>
            <th>訂單品項</th>
            <th>訂單日期</th>
            <th>訂單狀態</th>
            <th>操作</th>
          </tr>
        </thead>`;
  orderList.forEach(item => {
    // console.log(item);
    // 判斷訂單狀態
    let paymentStatus = item.paid === true? '已處理' : '未處理';
    // 取出訂單品項名稱
    let orderItemTitle = item.products.map(item => {
      return item.title
    }).join('、');
    // 換算訂單日期
    let date = new Date(item.createdAt);
    
    str += `<tr>
              <td>${item.createdAt}</td>
              <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
              </td>
              <td>${item.user.address}</td>
              <td>${item.user.email}</td>
              <td>
                <p>${orderItemTitle}</p>
              </td>
              <td>${date.getFullYear()}/${date.getMonth()}/${date.getDay()}</td>
              <td class="orderStatus">
                <a href="#">${paymentStatus}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${item.id}">
              </td>
            </tr>`
  });

  orderPageTable.innerHTML = str;
  
}

// 刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', e => {
  e.preventDefault();
  axios.delete(`${apiUrl}/orders`, {
    headers: {
      'authorization': token
    }
  })
    .then(response => {
      console.log(response);
      getOrderList();
    })
    .catch(err => {
      console.log(err);
    })
})

// 刪除訂單
orderPageTable.addEventListener('click',e => {
  e.preventDefault();
  if(e.target.value !== '刪除')return;
  // 訂單id
  const itemId = e.target.getAttribute('data-id');
  
  axios.delete(`${apiUrl}/orders/${itemId}`, {
    headers: {
      'authorization': token
    }
  })
  .then(response => {
    console.log(response);
    getOrderList();
  })
  .catch(err => {
    console.log(err);
  })
});

// (圖表)全產品類別營收比重
function getCategoryRevenueChart(orderList){
  let data = {}//{'床架': 0, '收納': 0, '窗簾': 0};

  // 取得類別營收
  orderList.forEach(item => {
    item.products.forEach(product => {
      data[product.category] ? data[product.category] += product.price : data[product.category] = product.price;
      // data[product.category] += product.price;
    });
  });

  // 生成圖表資料格式
  let ary = Object.keys(data).map(key => {
    return [key, data[key]]
  });

  // 生成圖表
  var chart = c3.generate({
    bindto: `#chart1`,
    data: {
      columns: ary,
      type: 'pie',
    },
    pie: {
      label: {
        format: function (value, ratio, id) {
          return d3.format(".0%")(ratio);
        }
      }
    },
    color: {
      pattern: ['#B7B2EC', '#8C70F2', '#6A33F8', '#28048B']
    }
  });
};

// (圖表)全品項營收比重
function getProductRevenueChart(orderList) {
  // 取得全品項與營收
  let data = {};
  orderList.forEach(item => {
    item.products.forEach(product => data[product.title] = product.price);
  });
  
  // 物件轉陣列
  let ary = Object.keys(data).map(key => [key, data[key]])
    .sort((a, b) => b[1] - a[1]); // 營收排序
  
  // 其他項目總額
  let otherItemPrice = ary.slice(3).reduce((sum, item) => sum += item[1], 0);

  ary.splice(3);// 刪除第三項之後的項目
  ary.push(['其他', otherItemPrice]); // 新增'其他'項目
  
  // 生成圖表
  var chart = c3.generate({
    bindto: `#chart2`,
    data: {
      columns: ary,
      type: 'pie',
    },
    pie: {
      label: {
        format: function (value, ratio, id) {
          return d3.format(".0%")(ratio);
        }
      }
    },
    color: {
      pattern: ['#B7B2EC', '#8C70F2', '#6A33F8', '#28048B']
    }
  });
};

// 初始化
function init() {
  getOrderList();
};

init();