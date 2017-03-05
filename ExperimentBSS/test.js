var _units = {
    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    symbols: ['+', '$', '%', '!', '#', '&', '@', '?', '*', '~']
};

var getRamdonString = function(_length) {
    var baseTypeIndexMap = Object.keys(_units);
    var typeCount = baseTypeIndexMap.length;
    var blockCount = Math.floor(Math.floor(_length / typeCount));
    var blocks = [], block, i, typeIndexMap;

    function fillBlockWithRandomUnit() {
        var index, typeIndex;
        typeIndex = Math.floor(Math.random() * typeIndexMap.length);
        if(typeIndex >= typeIndexMap.length) {
            throw new Error('Unexpected');
        }
        index = Math.floor(Math.random() * _units[typeIndexMap[typeIndex]].length);
        block.push(_units[typeIndexMap[typeIndex]][index]);
        typeIndexMap.splice(typeIndex, 1);
    }

    while(blocks.length < blockCount) {
        block = [];
        typeIndexMap = baseTypeIndexMap.slice(0);
        while(typeIndexMap.length > 0) {
            fillBlockWithRandomUnit();
        }
        blocks.push(block);
    }
    block = [];
    i = blocks.length * typeCount;
    typeIndexMap = baseTypeIndexMap.slice(0);
    while(i++ < _length) {
        fillBlockWithRandomUnit();
    }
    blocks.push(block);
    return Array.prototype.concat.apply([], blocks);
};

console.log(getRamdonString(3));
console.log(getRamdonString(3));
console.log(getRamdonString(4));
console.log(getRamdonString(4));
console.log(getRamdonString(5));
console.log(getRamdonString(5));
console.log(getRamdonString(6));
console.log(getRamdonString(6));
console.log(getRamdonString(7));
console.log(getRamdonString(7));
console.log(getRamdonString(8));
console.log(getRamdonString(8));
console.log(getRamdonString(9));
console.log(getRamdonString(9));
console.log(getRamdonString(10));
console.log(getRamdonString(10));
console.log(getRamdonString(11));
console.log(getRamdonString(11));
