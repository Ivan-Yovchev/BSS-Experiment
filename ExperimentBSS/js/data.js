(function() {
    var namespace = window.bssExperiment = window.bssExperiment || {};

    namespace.stateExamineData = function() {
        if(!bssExperiment.hasExperimentPassword()) {
            return Promise.resolve();
        }
        return clearData().then(function() {
            return loadDatabaseData();
        }).then(function() {
            $('body>*').hide();
            $('#dataManipulator').show();
            var deferred = $('#dataManipulator').data('await') || defer();
            $('#dataManipulator').data('await', deferred);
            return deferred.promise;
        });
    };

    function clearData() {
        var table = $('#dataTable').get(0);
        var tbody = table.tBodies.item(0);
        while(tbody.rows.length > 0) {
            tbody.deleteRow(0);
        }
        return Promise.resolve();
    }

    function dataExport() {
        var table = $('#dataTable').get(0);
        var thead = table.tHead;
        var tbody = table.tBodies.item(0);
        var csvData = [], rowData = [], i, length;
        $('th', thead).each(function(index, element) {
            rowData.push(escapeCsv(element.textContent));
        });
        csvData.push(rowData.join(','));
        for(i = 0, length = tbody.rows.length; i < length; ++i) {
            rowData = $(tbody.rows.item(i)).data('csv');
            csvData.push(rowData.map(escapeCsv).join(','));
        }
        var finalData = csvData.join('\r\n');
        finalData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(finalData);
        var exporter =  $('#fileExport').get(0);
        exporter.href = finalData;
        exporter.download = 'experiment.csv';
        exporter.click();
    }

    function escapeCsv(text) {
        text = text.trim();
        if(text.length >= 0 || text.indexOf(',') >= 0 || text.charAt(0)  === '"' || text.charAt(text.length - 1) === '"') {
            return '"' + text.replace(/"/g, '""') + '"';
        }
        return text;
    }

    function loadDatabaseData() {
        return bssExperiment.getData().then(function(data) {
            var table = $('#dataTable').get(0);
            var tbody = table.tBodies.item(0);
            data.forEach(function(row) {
                var csvArray = [];
                var tableRow = tbody.insertRow(-1);
                $(tableRow).data('data', row);
                var nameCell = tableRow.insertCell(0);
                csvArray.push(nameCell.textContent = row.user && row.user.name || '');
                var groupCell = tableRow.insertCell(1);
                csvArray.push(groupCell.textContent = row.user && row.user.group || '');
                var testDateCell = tableRow.insertCell(2);
                csvArray.push(testDateCell.textContent = (row.user && isFinite(parseInt(row.user.testedOn)) && formatDate(new Date(parseInt(row.user.testedOn))) || ''));
                var testTimeCell = tableRow.insertCell(3);
                csvArray.push(testTimeCell.textContent = (row.user && isFinite(parseInt(row.user.testedOn)) && formatTime(new Date(parseInt(row.user.testedOn))) || ''));
                var groupCell = tableRow.insertCell(4);
                csvArray.push(groupCell.textContent = row.user && row.user.rememberedItems + '' || '');
                var originalSequenceCell = tableRow.insertCell(5);
                csvArray.push(originalSequenceCell.textContent = row.originalString);
                var userSequenceCell = tableRow.insertCell(6);
                csvArray.push(userSequenceCell.textContent = row.userString);
                var matchCell = tableRow.insertCell(7);
                csvArray.push(matchCell.textContent = row.originalString === row.userString ? 'Yes' : 'No');
                var inputTimeCell = tableRow.insertCell(8);
                csvArray.push(inputTimeCell.textContent = String(row.inputEnd - row.inputStart));
                $(tableRow).data('csv', csvArray);
            });
        });
    }

    function zeroFill(s, n) {
        s = '' + s;
        while(s.length < n) {
            s = '0' + s;
        }
        return s;
    }

    function formatDate(date) {
        return date.getFullYear() + '-' + zeroFill(date.getMonth() + 1, 2) + '-' + zeroFill(date.getDate(), 2);
    }

    function formatTime(date) {
        return zeroFill(date.getHours(), 2) + ':' + zeroFill(date.getMinutes(), 2) + ':' + zeroFill(date.getSeconds(), 2);
    }

    $(function() {
        $('#dataManipulator .data-control').button();
        $('#dataManipulator .control-group').controlgroup();

        $('#dataBack').on('click', function(event) {
            event.preventDefault();
            var deferred = $('#dataManipulator').data('await');
            if(!deferred) {
                return;
            }
            $('#dataManipulator').removeData('await');
            deferred.resolve();
        });
        $('#dataExport').on('click', function(event) {
            var deferred = $('#dataManipulator').data('await');
            if(!deferred) {
                return;
            }
            dataExport();
        });
    });
})();