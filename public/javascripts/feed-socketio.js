var socket = io.connect('http://' + location.host);

function roundToTwo(num, point){
    return Math.ceil(num * point)/point;
}

function update_nodes_active(data){
    tr = document.getElementById("currency="+data.currency);
    if (tr != null){
        if (data.active){
            tr.cells[2].childNodes[0].attributes[0].value = "label label-success";
            tr.cells[2].childNodes[0].childNodes[0].data = "Active";
        }else{
            tr.cells[2].childNodes[0].attributes[0].value = "label label-danger";
            tr.cells[2].childNodes[0].childNodes[0].data = "Maintenance";
        }
    }
};


function update_nodes_block(data){
    tr = document.getElementById("currency="+data.currency);
    if (tr != null){
        tr.cells[4].childNodes[0].data = data.block;
    }
};

function update_nodes_progress(data){
    tr = document.getElementById("currency="+data.currency);
    if (tr != null){
        tr.cells[5].childNodes[0].childNodes[0].attributes[1].value = "width: "+ roundToTwo((data.progress)*100,10).toString() + "%";
        tr.cells[5].childNodes[0].childNodes[0].childNodes[0].data = roundToTwo((data.progress)*100,10).toString() + "%";
    }
};

function update_nodes_time(data){
    tr = document.getElementById("currency="+data.currency);
    if (tr != null){
        tr.cells[6].childNodes[0].data = moment(Number(data.lastblock)).format("YYYY-MM-DD HH:mm:ss");
    }
};

function update_nodes_connection(data){
    tr = document.getElementById("currency="+data.currency);
    if (tr != null){
        tr.cells[7].childNodes[0].data = data.connection;
    }
};


socket.on('new message', function (data) {
    console.log('data:' + data);
    jsondata = JSON.parse(data);

    switch (jsondata.command) {
        case "PING-PONG":
            break;
        case "node-active":
            update_nodes_active(jsondata);
            break;
        case "node-block":
            update_nodes_block(jsondata);
            break;
        case "node-progress":
            update_nodes_progress(jsondata);
            break;
        case "node-lastblock":
            update_nodes_time(jsondata);
            break;
        case "node-connection":
            update_nodes_connection(jsondata);
            break;
        default:
            console.log(jsondata.command + " unknown command");
    }

});
