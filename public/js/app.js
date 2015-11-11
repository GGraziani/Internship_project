

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
            var data = out.average24h;
            console.log(data)

            function doPlot(position) {
                $.plot($("#average-chart"), [{
                    data: data,
                    label: "Power Consumption",
                    //yaxis: 2
                }], {
                    xaxes: [{
                        mode: 'time'
                    }],
                    yaxes: [{
                        alignTicksWithAxis: position == "right" ? 1 : null,
                        position: position,
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

                        onHover: function(flotItem, $tooltipEl) {
                            // console.log(flotItem, $tooltipEl);
                        }
                    }
                });
            }
            doPlot("right");

            $("button").click(function() {
                doPlot($(this).text());
            });
        });
    });
}

function getUrl(){
    var location = window.location.pathname;

    if(location == "/home"){
        return "/dashboard"
    }
}