
var dataObj = {}

window.onload = function(){
    getPageContent();
    setUpPageUpdate();
};


/* ---------------- Render Procedure ----------------*/

/* render a page depending on the current URL */
function getPageContent() {

    if(getPageUrl() == "/dashboard") renderDashboard();
}

function getPageUrl(){
    var location = window.location.pathname;

    if(location == "/home"){
        return "/dashboard"
    }
}

/* Render the dashboard */
function renderDashboard(){
    dust.render("dashboard", {}, function(err, out){
        document.getElementById('page-wrapper').innerHTML = out;
        doJSONRequest("GET", getPageUrl(), {}, {}, function(out) {



            dust.render("pdu", out.pdu, function(err, out){
                document.getElementById('container-fluid').innerHTML += out;
            });

            var data = {
                plot_data : [
                    {
                        data : out.average24h,
                        label : "Average Consumption"},
                    {
                        data : out.total24h,
                        label : "Total Consumption"}
                ],

                cons : out.instantCons,

                nPdu : out.pdu
            };
            createObj("#generalOvw", data);
            fillStatContent("#generalOvw", data);
        });
    });
}

function createObj(ID, data){
    dataObj[ID] = {
        state : 1,
        date : new Date(),
        panels : {
            area_chart : {
                data : data.plot_data
            },
            gauge_chart : {
                data : data.cons
            },
            add_cons : {}
        }
    }
}





function fillStatContent(panelID, data){
    var id = panelID.substr(1);
    console.log(id);

    doPlot(data.plot_data, $("#total-chart-"+id), "right");
    var n_pdu = data.cons[1] || 1;

    var key, val, def = 0, values1 = {}

    for (var i = 0 ; i<=8; i++){
        key = (100/8 * i)+"";
        val = (def *n_pdu)+"";
        values1[key] = val;
        def+=0.5;
    }

    var value = data.cons[0] || data.cons;
    console.log(value);

    dataObj[panelID].panels.gauge_chart.obj = new Gauge($("#gauge-"+id),{
        values: values1,
        colors: {
            0 : '#378618',
            50 : '#ffa500',
            87.5 : '#f00',
            92.5 : '#000'
        },
        angles: [
            160,
            380
        ],
        lineWidth: 3,
        arrowWidth: 10,
        // arrowColor: '#555555',

        inset:true,
        value: (value/(def*n_pdu)*100)
    });
}

/* create a plot */
function doPlot(dataArr, chart, position) {
    $.plot(chart, dataArr, {
        xaxes: [{
            mode: 'time'
        }],
        yaxes: [{
            alignTicksWithAxis: position == "right" ? 1 : null,
            position: position

        }],
        legend: {
            position: 'sw'
        },
        grid: {
            hoverable: true //IMPORTANT! this is needed for tooltip to work
        },
        tooltip: true,
        tooltipOpts: {
            content: "%s for %x was %y",
            xDateFormat: "%y-%0m-%0d",
        }
    });
}
/* Shows or hide statistics  */
function statPanel(Elem, ip){
    var id = "#"+Elem.id;
    if(Elem.className.indexOf("inactive")>0){
        Elem.className = Elem.className.replace("inactive","active");
        var indicator = Elem.getElementsByClassName("list_indicator")[0];
        indicator.className = indicator.className.replace("right","down");
        if(ip){


            if(getUpdateState(id) == undefined){ // panel never rendered --> all data to retrieve
                getDataAndFill(id, ip, "getData")
            }else if(getUpdateState(id) == 0){ // panel already rendered --> to update
                getDataAndFill(id, ip, "update")
            }
            console.log("Now "+id+" is up to date!!");
        }


    } else{
        Elem.className = Elem.className.replace("active","inactive");
        var indicator = Elem.getElementsByClassName("list_indicator")[0];
        indicator.className = indicator.className.replace("down","right");
        if(ip){
            descheduleUpdate(id)
        }

    }
}

/* ---------------- Update Procedure ---------------- */

var UpdateObj = {};
var UpdateTimeObj = {};
var UpdateVar;
function setUpPageUpdate(){
    if(getPageUrl() == "/dashboard") {
        setUpdateTimeout();
    }
}

function setUpdateTimeout(){
    clearTimeout(UpdateVar);
    console.log("Setting next update timeout:");
    UpdateVar = setTimeout(Update, getUpdateInterval())

}

function scheduleUpdate(panelID) {
    console.log(panelID);
    dataObj[panelID].state = 1
}

function descheduleUpdate(panelID) {
    dataObj[panelID].state = 0;
}

function getUpdateState(id){
    return UpdateObj[id];
}

function changeUpdatetime(id){
    UpdateTimeObj[id] = new Date();
}

function getUptime(id){
    return UpdateTimeObj[id];
}

function Update(){
    var ID,
        upArr = Object.keys(UpdateObj);
    for(var i in upArr){
        ID = upArr[i];
        if(UpdateObj[ID] == 2){
            console.log("To Update:"+ID);


        }
    }

    console.log("Update done");
    setUpdateTimeout();
}

function getUpdateInterval(oldID){

    var time = getUptime(oldID) || new Date();
    var next_int = time.getMinutes();

    if ((next_int-1)%10 == 0) next_int++;
    while((next_int-1)%10 != 0){
        next_int++;
    }

    var interval = ((next_int - time.getMinutes())*60 - time.getSeconds())*1000 - time.getMilliseconds();
    if(!oldID)
        console.log("\t\t "+interval/1000+" sec");
    return interval;
}

function checkUpdate(oldID){
    var upInt = getUpdateInterval(oldID);
    console.log("upInt: "+ upInt)

    var actualInt = new Date().getTime() - getUptime(oldID).getTime();
    console.log("actualInt: "+ actualInt);

    return upInt > actualInt? true : false;
}




function getDataAndFill(ID, ip, url){
    console.log(ID+":  "+ url+ip);

    if(url.indexOf("getData") != -1){
        doJSONRequest("GET", "/getData/"+ip, {}, {}, function(out) {
            var data = {
                plot_data : [
                    {
                        data : out.total24h,
                        label : "Total Consumption"}
                ],

                cons : out.instantCons
            };
            createObj(ID, data),
            fillStatContent(ID, data);
        });

    } else if(url.indexOf("update") != -1){
        if(!checkUpdate(ID)){
            console.log("to update")
            //doJSONRequest("GET", "/update/"+ip, {}, {}, function(out) {
            //
            //});

        } else {
            console.log("already up to date")
        }


    }

    //doJSONRequest("GET", url+ip, {}, {}, function(out) {
    //
    //    if(url.indexOf("getData") != -1){
    //        console.log("rendering "+ID);
    //        var data = {
    //            plot_data : [
    //                {
    //                    data : out.total24h,
    //                    label : "Total Consumption"}
    //            ],
    //
    //            cons : out.instantCons
    //        };
    //
    //        fillStatContent(ID, data);
    //    } else {
    //        console.log("updating "+ID);
    //
    //
    //    }
    //
    //});
}