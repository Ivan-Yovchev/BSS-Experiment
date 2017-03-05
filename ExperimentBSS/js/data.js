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

    function loadDatabaseData() {
        return bssExperiment.getData().then(function(data) {
            var table = $('#dataTable').get(0);
            var tbody = table.tBodies.item(0);
            data.forEach(function(row) {
                var tableRow = tbody.insertRow(-1);
                $(tableRow).data('data', row);
                var checkBoxCell = tableRow.insertCell(0);
                var checkBox = $('<input type="checkbox" class="select-item" />').get(0);
                $(checkBoxCell).append(checkBox);
                $(checkBox).on('change', onCheckboxChange);
                var nameCell = tableRow.insertCell(1);
                nameCell.textContent = row.user && row.user.name || '';
                var groupCell = tableRow.insertCell(2);
                groupCell.textContent = row.user && row.user.group || '';
                var testTimeCell = tableRow.insertCell(3);
                testTimeCell.textContent = (new Date(row.testTimeCell)).toString();
                var originalSequenceCell = tableRow.insertCell(4);
                originalSequenceCell.textContent = row.originalString;
                var userSequenceCell = tableRow.insertCell(5);
                userSequenceCell.textContent = row.userString;
                var matchCell = tableRow.insertCell(6);
                matchCell.textContent = row.originalString === row.userString ? 'Yes' : 'No';
                var inputStartCell = tableRow.insertCell(7);
                inputStartCell.textContent = row.inputStart;
                var inputEndCell = tableRow.insertCell(8);
                inputEndCell.textContent = row.inputEnd;
                var inputTimeCell = tableRow.insertCell(9);
                inputTimeCell.textContent = String(row.inputEnd - row.inputStart);
                $('td', tableRow).on('click', onRowClick);
            });
        });
    }

    function onRowClick(event) {
        if($(event.target).hasClass('select-item')) {
            return;
        }
        var row = $(event.currentTarget).parents('tr').get(0);
        var checkbox = $('.select-item', row).get(0);
        checkbox.checked = !checkbox.checked;
        if(checkbox.checked) {
            $(row).addClass('selected');
        } else {
            $(row).removeClass('selected');
        }
    }

    function onCheckboxChange(event) {
        var row = $(event.currentTarget).parents('tr').get(0);
        var checkbox = event.currentTarget;
        if(checkbox.checked) {
            $(row).addClass('selected');
        } else {
            $(row).removeClass('selected');
        }
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
    });
})();