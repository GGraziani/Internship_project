

window.onload = function(){
    getPageContent()

};


function getPageContent() {

    if(getUrl() == "/dashboard") renderDashboard();
}

function renderDashboard(){
    dust.render("dashboard", {}, function(err, out){
        document.getElementById('page-wrapper').innerHTML = out;
        doJSONRequest("GET", getUrl(), {}, {}, function(out) {


            dust.render("pdu", out.pdu, function(err, out){
                document.getElementById('container-fluid').innerHTML += out;
            });

            doPlot([
                {
                    data : out.average24h,
                    label : "Average Consumption"},
                {
                    data : out.total24h,
                    label : "Total Consumption"}
                ], "#total-chart", "right");

            // TO DO: display instant consuption and
            //var inst = out.instantCons;
        });
    });
}

function getUrl(){
    var location = window.location.pathname;

    if(location == "/home"){
        return "/dashboard"
    }
}

function doPlot(dataArr, chart, position) {
    $.plot($(chart), dataArr, {
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
function statPanel(Elem, ip){
    if(Elem.className.indexOf("unactive")>0){
        Elem.className = Elem.className.replace("unactive","active");
        var indicator = Elem.getElementsByClassName("list_indicator")[0];
        console.log("right",indicator.className)
        indicator.className = indicator.className.replace("right","down");


    } else{
        Elem.className = Elem.className.replace("active","unactive");
        var indicator = Elem.getElementsByClassName("list_indicator")[0];
        console.log(indicator.className)
        indicator.className = indicator.className.replace("down","right");
    }

}
