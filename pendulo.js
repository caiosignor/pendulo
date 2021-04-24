const width = 900;
const height = 700;

let g = $("#gravidade_input").val();

function cria_pendulo(x0, y0, comprimento, a, m, a_inicial) {
    return {
        x0: x0,
        y0: y0,
        comprimento: comprimento,
        a: a,
        v_angular: 0,
        a_angular: a_inicial,
        m: m,
        x1: function () { return this.comprimento * Math.sin(this.a) },
        y1: function () { return this.comprimento * Math.cos(this.a) },
        at_v_angular: function () { this.v_angular += this.a_angular; return this.v_angular },
        at_a: function () { this.a += this.v_angular; return this.a },
    }
}

let p1, p2;
let lista_pendulos = [];

let canvas;
var data, chart;

function setup() {
    createCanvas(width, height);

    p1 = cria_pendulo(0, 0, 125, Math.PI / 2, 10, 0.002);
    p2 = cria_pendulo(p1.x1(), p1.y1(), 125, Math.PI / 8, 10, 0.005);

    lista_pendulos.push(p1);
    lista_pendulos.push(p2);

    google.charts.load('current', { 'packages': ['line'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {

        data = google.visualization.arrayToDataTable([
            ['Tempo', 'Acel. Ang p 1', 'Acel. Ang p. 2'],
            [0, 0, 0]
        ]);


        var options = {
            chart: {
                title: 'Box Office Earnings in First Two Weeks of Opening',
                subtitle: 'in millions of dollars (USD)'
            },
            width: 900,
            height: 500,
            axes: {
                x: {
                    0: { side: 'top' }
                }
            }
        };

        chart = new google.charts.Line(document.getElementById('curve_chart'));
        chart.draw(data, google.charts.Line.convertOptions(options));
    }


}


function draw() {
    g = $("#gravidade_input").val();
    p1.m = $("#m1_input").val();
    p2.m = $("#m2_input").val();
    p1.comprimento = $("#c1_input").val();
    p2.comprimento = $("#c2_input").val();

    background(255);
    stroke(0);
    translate(width / 2, height / 2);

    p1.a_angular = (-g * (2 * p1.m + p2.m) * Math.sin(p1.a) - p2.m * g * Math.sin(p1.a - 2 * p2.a) - 2 * sin(p1.a - p2.a) * p2.m * (p2.v_angular * p2.v_angular * p2.comprimento + p1.v_angular * p1.v_angular * p1.comprimento * Math.cos(p1.a - p2.a))) / (p1.comprimento * (2 * p1.m + p2.m - p2.m * Math.cos(2 * p1.a - 2 * p2.a)));
    p2.a_angular = ((2 * Math.sin(p1.a - p2.a)) * (p1.v_angular * p1.v_angular * p1.comprimento * (p1.m + p2.m) + g * (p1.m + p2.m) * Math.cos(p1.a) + p2.v_angular * p2.v_angular * p2.comprimento * p2.m * Math.cos(p1.a - p2.a))) / (p2.comprimento * (2 * p1.m + p2.m - p2.m * Math.cos(2 * p1.a - 2 * p2.a)));

    let p_anterior = lista_pendulos[0];

    for (var p of lista_pendulos) {
        if (p_anterior === p) //se for o primeiro
        {
            line(p_anterior.x0, p_anterior.y0, p.x1(), p.y1());
            ellipse(p.x1(), p.y1(), p.m, p.m);
            fill(0);
        }
        else {
            line(p_anterior.x1(), p_anterior.y1(), p.x1() + p_anterior.x1(), p.y1() + p_anterior.y1());
            fill(0);
            ellipse(p.x1() + p_anterior.x1(), p.y1() + p_anterior.y1(), p.m, p.m);
        }
        p_anterior = p;
    }


    for (var p of lista_pendulos) {
        p.at_v_angular();
        p.at_a();
    }
    
    if (data) {
        if (data.Vf.length > 200) {
            data.Vf.shift();
        }
        data.addRow([window.performance.now()/1000, p1.a_angular, p2.a_angular]);
        chart.draw(data);
    }
}