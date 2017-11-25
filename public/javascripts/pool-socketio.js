var socket = io.connect('http://' + location.host);

var data = []
    , totalPoints = 30;

var max = 5;


var plot = $.plot("#placeholder", [getRandomData(0)], {
    series: {
        shadowSize: 0 // Drawing is faster without shadows
    }
    , yaxis: {
        min: 0
        , max: 5
    }
    , xaxis: {
        show: false
    }
    , colors: ["#55ce63"]
    , grid: {
        color: "#AFAFAF"
        , hoverable: true
        , borderWidth: 0
        , backgroundColor: '#FFF'
    }
    , tooltip: true
    , tooltipOpts: {
        content: "Hashrate: %y"
        , defaultTheme: false
    }
});

function getRandomData(hash) {
    if (data.length > 0) data = data.slice(1);
    // Do a random walk
    while (data.length < totalPoints) {
        // var prev = data.length > 0 ? data[data.length - 1] : 0
        //     , y = prev + hash;
        var y = hash;
        data.push(y);
    }
    // Zip the generated y values with the x values
    var res = [];
    for (var i = 0; i < data.length; ++i) {
        res.push([i, data[i]])
    }
    return res;
}

function roundToTwo(num, point){
    return Math.ceil(num * point)/point;
}

function update_pool_currency(data){
    tr = document.getElementById("currency=" + data.currency);
    if (tr != null){
            tr.cells[1].childNodes[0].childNodes[0].data = data.assign;
            tr.cells[1].childNodes[1].childNodes[0].data = data.algo;
            tr.cells[2].childNodes[0].childNodes[0].data = data.diff;
            tr.cells[3].childNodes[0].childNodes[0].data = data.market;
            tr.cells[4].childNodes[0].src = "/images/logo/" + data.pair + ".png";
            tr.cells[4].childNodes[1].childNodes[0].data = " " + data.pair;
            tr.cells[5].childNodes[0].childNodes[0].data = data.price;
            tr.cells[6].childNodes[0].childNodes[0].data = data.block;
            tr.cells[7].childNodes[0].childNodes[0].data = data.reward;
            tr.cells[8].childNodes[0].childNodes[0].data = data.connection;
            tr.cells[9].childNodes[0].childNodes[0].data = data.profitability.toFixed(2);
    }else{
        var table=document.getElementById("myTable");
        var row=table.insertRow(myTable.rows.length);
        row.id = "currency=" + data.currency;

        var cell1=row.insertCell(0);
        var img = document.createElement('img');

        img.src = "/images/logo/" + data.currency + ".png";
        img.style.height = '48px';
        img.style.width = '48px';
        var txt = document.createElement('text');
        txt.data = " " + data.currency;
        txt.nodeValue = " " + data.currency;
        txt.textContent = " " + data.currency;
        cell1.appendChild(img);
        cell1.appendChild(txt);

        var cell2=row.insertCell(1);
        var h6 = document.createElement('h6');
        h6.textContent = data.assign;
        cell2.appendChild(h6);
        var small = document.createElement('small');
        small.class = "text-muted";
        small.textContent = data.algo;
        cell2.appendChild(small);

        var cell3=row.insertCell(2);
        var h5 = document.createElement('h5');
        h5.textContent = data.diff;
        cell3.appendChild(h5);

        var cell4=row.insertCell(3);
        var h5 = document.createElement('h5');
        h5.textContent = data.market;
        cell4.appendChild(h5);

        var cell5=row.insertCell(4);
        var img = document.createElement('img');
        img.src = "/images/logo/" + data.pair + ".png";
        img.style.height = '48px';
        img.style.width = '48px';
        cell5.appendChild(img);
        var h5 = document.createElement('text');
        h5.textContent = " " + data.pair;
        cell5.appendChild(h5);

        var cell6=row.insertCell(5);
        var h5 = document.createElement('h5');
        h5.textContent = data.price;
        cell6.appendChild(h5);

        var cell7=row.insertCell(6);
        var h5 = document.createElement('h5');
        h5.textContent = data.block;
        cell7.appendChild(h5);

        var cell8=row.insertCell(7);
        var h5 = document.createElement('h5');
        h5.textContent = data.reward;
        cell8.appendChild(h5);

        var cell9=row.insertCell(8);
        var h5 = document.createElement('h5');
        h5.textContent = data.connection;
        cell9.appendChild(h5);

        var cell10=row.insertCell(9);
        var h5 = document.createElement('h5');
        h5.textContent = data.profitability.toFixed(2);
        cell10.appendChild(h5);
    }

    console.log(data);

};

function update_pool_hashrate(data){

    time = document.getElementById("time");
    time.childNodes[3].childNodes[0].data = moment(new Date().getTime()).format("LLLL");

    if (max < parseFloat(data.hashrate)){
        max = parseFloat(data.hashrate) + ((parseFloat(data.hashrate)/100) * 25);
    }
    plot.setData([getRandomData(parseFloat(data.hashrate))]);
    plot.getAxes().yaxis.options.max = max;
    plot.setupGrid();
    plot.draw();

};

function update_pool_found_block(data){

    console.log(data);
};

function update_user_hashrate(data){

    widget = document.getElementById("worker_id=" + data.id);
    if (widget != null){
        widget.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].src = "/images/logo/" + data.currency + ".png";
        widget.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].data = data.hashrate;
        widget.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].data = data.worker;
    }else{
        var user = document.getElementById("user");

        var div_main = document.createElement('div');
        div_main.id = "worker_id=" + data.id;
        div_main.classList.add('col-lg-3');
        div_main.classList.add('col-md-6');
        user.appendChild(div_main);

        var card = document.createElement('div');
        card.classList.add('card');
        div_main.appendChild(card);

        var card_block = document.createElement('div');
        card_block.classList.add('card-block');
        card.appendChild(card_block);

        var row = document.createElement('row');
        card_block.appendChild(row);

        var d_flex = document.createElement('div');
        d_flex.classList.add('col-12');
        d_flex.classList.add('d-flex');
        d_flex.classList.add('flex-row');
        row.appendChild(d_flex);

        var d_flex2 = document.createElement('div');
        d_flex2.classList.add('col-12');
        d_flex2.classList.add('d-flex');
        d_flex2.classList.add('flex-row');
        row.appendChild(d_flex2);

        // var h52 = document.createElement('h5');
        // h52.classList.add('text-muted');
        // h52.classList.add('m-b-0');
        // h52.textContent = data.id;
        // d_flex2.appendChild(h52);

        var round_info = document.createElement('div');
        round_info.classList.add('align-self-center');
        round_info.classList.add('round-info');
        d_flex.appendChild(round_info);

        var img = document.createElement('img');
        img.src = "/images/logo/" + data.currency + ".png";
        img.classList.add('card-img-top');
        img.classList.add('align-self-center');
        img.style.height = '48px';
        img.style.width = '48px';
        round_info.appendChild(img);

        var align_self_center = document.createElement('div');
        align_self_center.classList.add('m-l-10');
        align_self_center.classList.add('align-self-center');
        d_flex.appendChild(align_self_center);

        var h3 = document.createElement('h3');
        h3.classList.add('m-b-0');
        h3.textContent = data.hashrate;
        align_self_center.appendChild(h3);

        var h5 = document.createElement('h5');
        h5.classList.add('text-muted');
        h5.classList.add('m-b-0');
        h5.textContent = data.worker;
        align_self_center.appendChild(h5);

    }

    console.log(data);

};

function drop_pool_currency(data){
    tr = document.getElementById("currency=" + data.currency);
    if (tr != null) {
        tr.parentNode.removeChild(tr);
        console.log(data.toString());
    }
};

function pool_user_drop(data){
    tr = document.getElementById("worker_id=" + data.id);
    if (tr != null) {
        tr.parentNode.removeChild(tr);
        console.log(data.toString());
    }
};

socket.on('new message', function (data) {
    console.log('data:' + data);
    jsondata = JSON.parse(data);

    switch (jsondata.command) {
        case "PING-PONG":
            break;
        case "pool-currency":
            update_pool_currency(jsondata);
            break;
        case "pool-hashrate":
            update_pool_hashrate(jsondata);
            break;
        case "pool-user-hashrate":
            update_user_hashrate(jsondata);
            break;
        case "pool-block-found":
            update_pool_found_block(jsondata);
            break;
        case "pool-currency-drop":
            drop_pool_currency(jsondata);
            break;
        case "pool-user-drop":
            pool_user_drop(jsondata);
            break;
        default:
            console.log(jsondata.command + " unknown command");
    }
});
