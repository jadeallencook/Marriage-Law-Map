    Promise.all([new Promise(function (res, rej) {
        var request = new XMLHttpRequest;
        request.onload = function () {
            res(JSON.parse(this.response));
        }
        // https://www.deseretnews.com/project/assets/json/
        request.open('get', 'assets/states.json');
        request.send();
    }), new Promise(function (res, rej) {
        var request = new XMLHttpRequest;
        request.onload = function () {
            res(JSON.parse(this.response));
        }
        request.open('get', 'assets/wed-minors.json');
        request.send();
    })]).then(function (response) {
        var map = L.map('map').setView([38, -97], 4),
            usm = response[0],
            data = response[1];

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Developed by <a href="http://www.jadeallencook.com" target="_blank">Jade Allen Cook</a> for <a href="https://www.deseretnews.com/" target="_blank">Deseret News</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoiamFkZWNvb2siLCJhIjoiY2ppNmt2MmVqMDF1cTN1cGZocW81bDF6byJ9.vp9JctWvs_8Jgxy17qSTZw',
            style: 'mapbox://styles/mapbox/light-v9'
        }).addTo(map);

        L.geoJSON(usm).addTo(map);

        function getColor(age) {
            return age === 17 ? '#fdf5f1' :
                age === 16 ? '#f3c0a9' :
                age === 15 ? '#e9785a' :
                age < 15 ? '#c1352c' :
                '#FFF';
        }

        function style(feature) {
            var minimum = 0;
            if (data[feature.properties.NAME]) minimum = data[feature.properties.NAME].minimum;
            return {
                fillColor: getColor(minimum),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.35
            };
        }

        L.geoJson(usm, {
            style: style
        }).addTo(map);

        function highlightFeature(e) {
            var layer = e.target;
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) layer.bringToFront();
            info.update(data[e.target.state], e.target.state);
        }

        function onEachFeature(feature, layer) {
            layer.state = feature.properties.NAME;
            layer.on({
                click: highlightFeature
            });
        }

        geojson = L.geoJson(usm, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);

        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props, state) {
            if ('ga' in window) ga('send', 'event', 'Child Marriage Map', 'State', state);
            if (props !== undefined) {
                // header
                this._div.innerHTML = '<h4>Child marriage in ' + state + '</h4>';
                // total wed
                if (props.total === null) this._div.innerHTML += '<b>Total Wed: </b> N/A';
                else this._div.innerHTML += '<b>Total Wed: </b>' + props.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');;
                // min age
                if (props.minimum === 0) this._div.innerHTML += '<br /><b>Minimum Age: </b> None';
                else this._div.innerHTML += '<br /><b>Minimum Age: </b>' + props.minimum;
                // youngest
                if (props.youngest === null) this._div.innerHTML += '<br /><b>Youngest Age: </b> None';
                else this._div.innerHTML += '<br /><b>Youngest Age: </b>' + props.youngest;
                // other
                if (props.judicial) this._div.innerHTML += '<br /><b>Needs judicial approval: </b>' + props.judicial;
                if (props.pregnancy) this._div.innerHTML += '<br /><b>Pregnancy: </b> Yes';
                if (props.consent) this._div.innerHTML += '<br /><b>One parent\'s consent: </b> Yes';
                if (props.range) this._div.innerHTML += '<br /><b>Range: </b>' + props.range;
            } else {
                this._div.innerHTML = '<h4>Marriage Info</h4>';
                this._div.innerHTML += 'Click on a state!';
            }
        };

        info.addTo(map);

        var legend = L.control({
            position: 'bottomright'
        });

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [18, 17, 16, 15, null];
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML += '<i style="background:' + getColor(grades[i]) + '"></i> ';
                if (grades[i] === null) div.innerHTML += '<<br />';
                else div.innerHTML += grades[i] + '<br />';
            }
            return div;
        };

        legend.addTo(map);

    });