/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

let imagematual = ""
let listapedidos = [];

function onDeviceReady() {
  // Cordova is now initialized. Have fun!

  console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

  // Switch screens buttons setup
  document.querySelectorAll(".trocartela")
    .forEach(btnSwitchScreen => btnSwitchScreen.addEventListener("click", trocartela))

  document.getElementById("salvarpedido").addEventListener("click", salvarpedido)
  document.getElementById("salvarpedido").addEventListener("click", trocartela)

  document.getElementById("deletarpizza").addEventListener("click", deletarpizza)
  document.getElementById("deletarpizza").addEventListener("click", trocartela)

  document.getElementById("telapedido").addEventListener("click", function () {
    editarpedido()
  })

  document.getElementById("tirarfoto").addEventListener("click", tirarfoto)

  listarPedidos()
}


function listarPedidos() {
  cordova.plugin.http.get("https://pedidos-pizzaria.glitch.me/admin/pizzas/artur", {}, {},
    function (okResponse) {
      atualizarLista(JSON.parse(okResponse.data))
    },
    function (errResponse) {
      console.log({ errResponse })
      alert("Error finding orders!")
    })

}

function trocartela(btn) {
  let { nextScreen, originScreen } = btn.srcElement.dataset

  document.getElementById(originScreen).classList.add("escondido")
  document.getElementById(nextScreen).classList.remove("escondido")

  imagematual = "";
}



function titulopedido(order) {
  let fmtPrice = order.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  let orderTitle = document.createElement('h2')
  orderTitle.classList.add('order-name')
  orderTitle.innerText = `${order.pizza} | ${fmtPrice}`

  return orderTitle
}

function imagempedido(pedido, element) {
  let divpedido = document.createElement('div')

  if (pedido.imagem.startsWith('data:image/jpeg;base64,')) {
    divpedido.classList.add('imagempedido')
    divpedido.style.backgroundImage = 'url(' + pedido.imagem + ')'
    divpedido.style.backgroundRepeat = 'no-repeat'
    divpedido.style.backgroundPosition = 'center'
    divpedido.style.backgroundSize = 'cover'
  } else {
    divpedido.classList.add('imagempedido', 'pedidosemfoto')
  }

  return divpedido
}

function editarpedido(order) {
  let orderNameInput = document.getElementById('nomepizza')
  let orderPriceInput = document.getElementById('pizza-price')
  let picturePreview = document.getElementById('pizza-preview')
  let savePizzaBtn = document.getElementById("salvarpedido")
  let deletarpizzaBtn = document.getElementById("deletarpizza")

  savePizzaBtn.removeEventListener("click", salvarpedido)
  savePizzaBtn.removeEventListener("click", atualizarpizza)

  if (order) {
    orderNameInput.value = order.pizza
    orderPriceInput.value = order.preco
    picturePreview.style.backgroundImage = order.imagem.startsWith('data:image/jpeg;base64,') ? 'url(' + order.imagem + ')' : 'url(../img/pedidosemfoto.jpg)'
    savePizzaBtn.addEventListener("click", function () {
      atualizarpizza(order["_id"])
    })
    deletarpizzaBtn.classList.remove("hidden")
  } else {
    orderNameInput.value = ''
    orderPriceInput.value = ''
    picturePreview.style.backgroundImage = ''
    savePizzaBtn.addEventListener("click", salvarpedido)
    deletarpizzaBtn.classList.add("hidden")
  }

  //btn.srcElement.dataset
  trocartela({ srcElement: { dataset: { nextScreen: 'telacriarpedido', originScreen: 'telalistapedidos' } } })

  imagematual = order ? order.imagem : ""
}
function atualizarLista(orders) {
  let orderList = document.querySelector(".listadepedidos")

  orderList.innerHTML = ""

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];

    let elementopedido = document.createElement('div')

    elementopedido.classList.add('itemlistapedidos')

    elementopedido.appendChild(imagempedido(order))
    elementopedido.appendChild(titulopedido(order))

    elementopedido.onclick = function () {
      editarpedido(order)
    }

    orderList.appendChild(elementopedido)
  }
}

function salvarpedido() {
  let nome = document.querySelector("#nomepizza").value
  let preco = Number.parseFloat(document.querySelector("#pizza-price").value)

  cordova.plugin.http.setDataSerializer('json');

  cordova.plugin.http.post("https://pedidos-pizzaria.glitch.me/admin/pizza",
    {
      pizzaria: "artur",
      pizza: nome,
      preco: preco,
      imagem: "pequeno"
    }, {},
    function (okResponse) {
      listarPedidos()
      alert("Pedido salvo")
    },
    function (errResponse) {
      alert("Erro salvando pedido")
    })
}


function tirarfoto() {
  let imagem = document.getElementById("pizza-preview")

  navigator.camera.getPicture(onSuccess, onFail, {
    quality: 1,
    destinationType: Camera.DestinationType.DATA_URL
  });

  function onSuccess(imageData) {
    imagematual = "'data:image/jpeg;base64," + imageData + "'"
    imagem.style.backgroundImage = "url(" + imagematual + ")";
  }

  function onFail(message) {
    alert('Erro foto imagem ' + message);
  }
}

function atualizarpizza(id) {
  let novonome = document.querySelector("#nomepizza").value
  let novopreco = Number.parseFloat(document.querySelector("#pizza-price").value)

  cordova.plugin.http.setDataSerializer('json');

  cordova.plugin.http.put("https://pedidos-pizzaria.glitch.me/admin/pizza",
    {
      pizzaria: "artur",
      pizzaid: id,
      pizza: novonome,
      preco: novopreco,
      imagem: "não envia"
    }, {}, function (okResponse) {
      listarPedidos()
      alert("pedido atualizado")
    },
    function (errResponse) {
      alert("erro atualizando")
    })
}

function deletarpizza() {
  let nomepizza = document.querySelector("#nomepizza").value

  cordova.plugin.http.setDataSerializer('json');

  cordova.plugin.http.delete(encodeURI("https://pedidos-pizzaria.glitch.me/admin/pizza/artur/" + nomepizza),
    {}, {},
    function (okResponse) {
      listarPedidos()
      alert("Pedido cancelado")
    },
    function (errResponse) {
      alert("Erro cancelando o pedido")
    })
}