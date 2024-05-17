for (var i = 1; i <= 12; i++) {
    document.getElementById("monthBtn" + (i < 10 ? "0" : "") + i).addEventListener("click", function() {
        var month = this.innerText;
        displayOutput(month);
    });
}

function displayOutput(content) {
    console.log("顯示內容：" + content);
    var h3Element = document.getElementById("output");
    h3Element.innerHTML = content;
}

document.getElementById("addBtn").addEventListener("click", function() {
    var item = document.getElementById("text").value;
    var amount = document.getElementById("number").value;

    if (item.trim() === "" || amount.trim() === "") {
        alert("請輸入項目和金額");
        return;
    }

    displayOutput(item + "，金額：" + amount);

    document.getElementById("text").value = "";
    document.getElementById("number").value = "";
});

function displayOutput(content) {
    var h3Element = document.getElementById("output");
    h3Element.innerHTML += content + " ";
}

var transactions = JSON.parse(localStorage.getItem('myTransactions')) || [];

$(document).ready(function(){
    if(transactions.length > 0){
        initHistory(transactions);
    }

    $("#addBtn").click(function(e){
        e.preventDefault();
        var name = $('#text').val();
        var amount = parseFloat($('#number').val()) || 0;
        var id = generateID();
        addItem(name, amount, id, transactions);
        transactions.push({id: id, name: name, amount: amount});
        localStorage.setItem('myTransactions', JSON.stringify(transactions));
        updateValues();
    });
});
function generateID(){
    return Math.floor(Math.random()*1000000)
};

function addItem(name, amount, id, transactions) {
    var item_str = '<li class="' + (amount > 0 ? 'plus' : 'minus') + '">' + name + '<span>' + amount + '</span>' + '<button class="delete-btn" data-id="' + id + '">x</button>';
    $('#list').append(item_str);

    clearForm();
    $('.delete-btn').last().click(function () {
        $(this).parent().remove();
        var id = $(this).data('id');
        console.log("delete id: ", id);
        deleteItemFormLocalstorage(transactions, id);
        updateValues();
    });
}
function clearForm(){
    $('#form').find("input").val("");
}

function initHistory(transactions){
    transactions.forEach(function(item){
        addItem(item.name, item.amount, item.id, transactions);
    });
    updateValues();
}

function deleteItemFormLocalstorage(transactions, id){
    transactions.forEach(function(item, index, arr){
        if(item.id === id){
            arr.splice(index, 1);
        }
    });
    localStorage.setItem('myTransactions', JSON.stringify(transactions));
}
var transactions = JSON.parse(localStorage.getItem('myTransactions')) || [];

$(document).ready(function(){

    if(transactions.length > 0){
        initHistory(transactions);
    }

    $("#addBtn").click(function(e){
        e.preventDefault();
        var name = $('#text').val();
        var amount = $('#number').val();
        var id = generateID();
        addItem(name, amount, id, transactions);
        transactions.push({id: id, name: name, amount: amount});
        localStorage.setItem('myTransactions', JSON.stringify(transactions));
        updateValues();
    });
});

function generateID(){
    return Math.floor(Math.random()*1000000);
}

function addItem(name, amount, id, transactions){
    var item_str = '<li class="minus">' + name + '<span>' + amount + '</span>' + '<button class="delete-btn" data-id="' + id + '">x</button>';
    $('#list').append(item_str);

    if (amount > 0) {
        $('li').toggleClass('minus');
        $('li').addClass('plus');
    }

    clearForm();
    $('.delete-btn').last().click(function(){
        $(this).parent().remove();
        var id = $(this).data('id');
        console.log("delete id: ", id);
        deleteItemFormLocalstorage(transactions, id);
        updateValues();
    });
}

function clearForm(){
    $('#form').find("input").val("");
}

function initHistory(transactions){
    transactions.forEach(function(item){
        addItem(item.name, item.amount, item.id, transactions);
    });
    updateValues();
}

function deleteItemFormLocalstorage(transactions, id){
    transactions.forEach(function(item, index, arr){
        if(item.id === id){
            arr.splice(index, 1);
        }
    });
    localStorage.setItem('myTransactions', JSON.stringify(transactions));
}

function updateValues() {
    const amounts = transactions
        .map(function(transaction) {
            return parseFloat(transaction.amount);
        });

    const total = amounts
        .reduce(function(accumulator, item) {
            return accumulator + item;
        }, 0)
        .toFixed(2);

    const income = amounts
        .filter(function(item) {
            return item > 0;
        })
        .reduce(function(accumulator, item) {
            return accumulator + item;
        }, 0)
        .toFixed(2);

    const expense = amounts
        .filter(function(item) {
            return item < 0;
        })
        .reduce(function(accumulator, item) {
            return accumulator + item;
        }, 0)
        .toFixed(2) * -1;

    $('#balance').text(`$${total}`);
    $('#money-plus').text(`$${income}`);
    $('#money-minus').text(`$${expense}`);
}



 




