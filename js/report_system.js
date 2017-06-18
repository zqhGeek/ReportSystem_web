/**
 *
 * Created by Zero on 2017/6/14 0014.
 */
let myChart;
function getJson(json) {
    let time_array = [];
    let json_data;
    json_data = json;
    $.each(json, function (i, field) {
        time_array.push(field.time);
    });
    time_array.sort(function (a, b) {
        return Number(b) - Number(a);
    });
    window.sessionStorage.setItem("JSON_DATA", JSON.stringify(json_data));
    window.sessionStorage.setItem("TIME_ARRAY", JSON.stringify(time_array));
    console.log(time_array);
}
$(function () {
    let time_array = JSON.parse(window.sessionStorage.getItem("TIME_ARRAY"));
    let json_data = JSON.parse(window.sessionStorage.getItem("JSON_DATA"));
//        initDataBaseTable();
    // 基于准备好的dom，初始化echarts实例
    myChart = echarts.init(document.getElementById('chart_main'));
    initChart();
    myChart.showLoading();
    console.log(time_array);
    initDataBaseTable([], creatTimeHtml(time_array[0], time_array));
    setTableAndChartData(time_array[0]);
});

/**
 * 更新table数据
 */
function updateDetailTableData(dataArr) { //dataArr是表格数据数组，和初始化配置需一样的结构
    var table = $('#table_service').dataTable();
    var oSettings = table.fnSettings(); //这里获取表格的配置
    table.fnClearTable(this); //动态刷新关键部分语句，先清空数据
    for (var i = 0, l = dataArr.length; i < l; i++) {
        table.oApi._fnAddData(oSettings, dataArr[i]); //这里添加一行数据
    }
    oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
    table.fnDraw();//绘制表格
}

/**
 * 设置table和图标的数据
 */
function setTableAndChartData(select_time) {
    let time_array = JSON.parse(window.sessionStorage.getItem("TIME_ARRAY"));
    let json_data = JSON.parse(window.sessionStorage.getItem("JSON_DATA"));
    $.each(json_data, function (i, field) {
        if (typeof(field) === "object" && field.time === select_time) {
            updateDetailTableData(field.service);
            $(".overlay").remove();
            updateServiceChartData(select_time,field.service);
        } else {
            console.log(field.time);
        }
    });

}
/**
 *更新图表
 */
function updateServiceChartData(select_time,service_data) {
    let service_array = [];
    $("#chart_title").text(new Date(Number(select_time) * 1000).format("yyyy-MM-dd EEE"));
    $.each(service_data, function (k1, v1) {
        let service_model = {number: "", name: "", order: 0};
        service_model.name = v1.name;
        service_model.number = v1.number;
        service_model.order = 1;
        let model = service_array.find(function (currentValue, index, arr) {
            return currentValue.number === v1.number;
        });
        if (model === undefined) {
            service_array.push(service_model);
        } else {
            model.order = model.order + 1;
        }
    });
    let x_data = [];
    let y_data = [];
    for (let i = 0; i < service_array.length; i++) {
        x_data[i] = service_array[i].name;
        y_data[i] = service_array[i].order;
    }
    console.log(x_data);
    console.log(y_data);
    setChart(myChart, x_data, y_data);
}
/**
 * 创建下拉菜单
 * @param select_time
 * @param time_array
 * */
function creatTimeHtml(select_time, time_array) {
    let html = '<div class="dropdown" style="float: left;">' +
        '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
        new Date(Number(select_time) * 1000).format("yyyy-MM-dd EEE") +
        '<span class="caret"></span>' +
        '</button>' +
        '<ul class="dropdown-menu" aria-labelledby="dropdownMenu">';
    for (let i = 0; i < time_array.length; i++) {
        html = html + '<li><a class="date" id=' + time_array[i] + ' href="#" onclick="menuClick(this)">' + new Date(Number(time_array[i]) * 1000).format("yyyy-MM-dd EEE") + '</a></li>';
    }
    html = html + '</ul>';
    $("#table_service").data("Time", select_time);
    return html;

}
/*
 *
 * 下拉菜单点击
 * */
function menuClick(click) {
    let time = $(click).attr("id");
    let json_data = JSON.parse(window.sessionStorage.getItem("JSON_DATA"));
    $.each(json_data, function (i, field) {
        if (field.time === time) {
            updateDetailTableData(field.service);
            updateServiceChartData(time,field.service);
            let time_txt =new Date(Number(time) * 1000).format("yyyy-MM-dd EEE")+'<span class="caret"></span>';
            $("#dropdownMenu").html(time_txt)
        }
    });
}
/**
 * 初始化table
 * @param data
 * @param time_html
 */
function initDataBaseTable(data, time_html) {
    $("#table_service").DataTable({
        "dom": '<"time"><"print">frtip',
        "paging": false,
        "deferRender": true,//延迟渲染，可以提高初始化的速度
        "lengthChange": false,
        "searching": true,
        "ordering": true,
        "info": false,
        "autoWidth": true,
        "processing": false,
        "data": data,
//            "ajax": "../data/data.txt",
        "columns": [
            {"data": "number"},
            {"data": "name"},
            {"data": "table_number"},
            {"data": "order"},
            {"data": "time"}
        ],
        "language": {
            "zeroRecords": "暂无相关信息",
            "search": "搜索"
        }
    });
    $("div.time").html(time_html);
    $("div.print").html('<div style="width: 50px ;float: right; margin-left: 12px"><button type="button" class="btn btn-block btn-primary btn-sm" id="btn_print" onclick="print_data()">打印</button></div>');
}

/**
 * 打印json数据到CSV
 */
function print_data() {
    let time = $("#table_service").data("Time");
    let json_data = JSON.parse(window.sessionStorage.getItem("JSON_DATA"));
    let content = "";
    $.each(json_data, function (i, field) {
        if (field.time === time) {
            $.each(field.service, function (i, data) {
                content = content + data.number + "," + data.name + "," + data.table_number + "," + data.order + "," + data.time + "\n";
                console.debug(content);
            })
        }
    });
    //Excel打开后中文乱码添加如下字符串解决
    let exportContent = "\uFEFF";
    let blob = new Blob([exportContent + "员工编号,姓名,服务餐桌,服务类型,服务时长(min)\n" + content], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "hello world.csv");
//        $("#table_service").table2excel({
//            exclude: "",
//            name: "WorksheetName",
//            filename: "SomeFile" //do not include extension
//        });
}
/**
 * 设置图表数据
 * @param myChart
 * @param x_data
 * @param y_data
 */
function setChart(myChart, x_data, y_data) {
    // 指定图表的配置项和数据
    let option = {
        color: ['#3398DB'],
        title: {
            text: '员工绩效统计图'
        },
        tooltip: {},
        legend: {
            data: ['服务次数']
        },
        xAxis: {
            data: x_data
        },
        yAxis: {},
        series: [{
            name: '服务次数',
            type: 'bar',
            data: y_data
        }]
    };
    myChart.hideLoading();
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}

/**
 * 初始化图表数据
 */
function initChart() {

    // 指定图表的配置项和数据
    let option = {
        color: ['#3398DB'],
        title: {
            text: '员工绩效统计图'
        },
        tooltip: {},
        legend: {
            data: []
        },
        xAxis: {
            data: []
        },
        yAxis: {},
        series: [{
            name: '销量',
            type: 'bar',
            data: []
        }],

    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}
