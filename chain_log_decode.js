const https = require('https');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

let csvWriter;

let fileArr = [];
let fileArrLength = 0;
let chainEventLogArr = {};
let fileArrIndex = 0;
let duplicatedData = [];
const directoryPath = path.join(__dirname, 'data');
const savePath = 'decodedData';

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    files.forEach(function (file) {
      fileArr.push(file);
    });
    // console.log(fileArr)
    fileArrLength = fileArr.length;
    callBack();
});

function joinSameFile(fileName) {
    let category = fileName.split("_");
    let event = category[2];
    // if(event != "Swap") {
        category = category[0] + '_' + category[1] + '_events';
        let data = fs.readFileSync(`./data/${fileName}`, 'utf-8');
        let encodeData = JSON.parse(data).result;
        let encodeDataLength = encodeData.length;
        for(let i = 0; i < encodeDataLength; i ++) {
            encodeData[i].event = event;
        }
        if(eval(`chainEventLogArr.${category}`) == undefined) {
            eval(`chainEventLogArr.${category} = encodeData`);
        } else {
            eval(`chainEventLogArr.${category} = [...chainEventLogArr.${category}, ...encodeData]`);
        }
    // }
    setTimeout(callBack, 20)
}

function callBack() {
    if(fileArrIndex < fileArrLength) {
        joinSameFile(fileArr[fileArrIndex]);
        console.log(fileArr[fileArrIndex], fileArrIndex + 1, fileArrLength)
        fileArrIndex ++;
    } else {
        try {
        for(let i in chainEventLogArr) {
            let coin = i.split('_')[0];
            let topic = i.split('_')[1];
            
            csvWriter = createCsvWriter({
                path: `./${savePath}/${coin + '-' + topic + '-events'}.csv`,
                header: [
                    {id: 'blockNumber', title: 'BLOCKNUM'},
                    {id: 'timeStamp', title: 'TIMESTAMP'},
                    {id: 'transactionHash', title: 'TXHASH'},
                    {id: 'event', title: 'EVENTTYPE'},
                    {id: 'data1', title: 'data1'},
                    {id: 'data2', title: 'data2'},
                    {id: 'data3', title: 'data3'},
                    {id: 'data4', title: 'data4'},
                    {id: 'data5', title: 'data5'},
                    {id: 'data6', title: 'data6'},
                    {id: 'data7', title: 'data7'},
                    {id: 'data8', title: 'data8'},
                ]
            });
            let tempChainTopicEventData = chainEventLogArr[i];
            for(let j = 0; j < tempChainTopicEventData.length; j ++) {
                if(j >= 1){
                    if(tempChainTopicEventData[j].transactionHash == tempChainTopicEventData[j - 1].transactionHash){
                        console.log(tempChainTopicEventData[j].transactionHash, tempChainTopicEventData[j - 1].transactionHash);
                        chainEventLogArr[i].splice(j, 1);
                        duplicatedData.push(tempChainTopicEventData[j].transactionHash);
                    }
                }
                tempChainTopicEventData[j].blockNumber = '' + parseInt(tempChainTopicEventData[j].blockNumber, 16);
                tempChainTopicEventData[j].timeStamp = '' + parseInt(tempChainTopicEventData[j].timeStamp, 16);
                eval(splitData(tempChainTopicEventData[j].data));
            }

            //sort
            let length = chainEventLogArr[i].length;
            for(let a = 0; a < length; a ++) {
                console.log(a + 1, length, "//sorting")
                for(let b = a + 1; b < length; b ++) {
                    if(chainEventLogArr[i][b].blockNumber / 1 < chainEventLogArr[i][a].blockNumber / 1) {
                        let atemp = chainEventLogArr[i][a];
                        chainEventLogArr[i][a] = chainEventLogArr[i][b];
                        chainEventLogArr[i][b] = atemp;
                    }else if(chainEventLogArr[i][b].blockNumber == chainEventLogArr[i][a].blockNumber) {
                        if(chainEventLogArr[i][b].timeStamp / 1 < chainEventLogArr[i][a].timeStamp / 1) {
                            let atemp = chainEventLogArr[i][a];
                            chainEventLogArr[i][a] = chainEventLogArr[i][b];
                            chainEventLogArr[i][b] = atemp;
                        }else if(chainEventLogArr[i][b].timeStamp == chainEventLogArr[i][a].timeStamp) {
                            if(chainEventLogArr[i][b].transactionHash / 1 < chainEventLogArr[i][a].transactionHash / 1) {
                                let atemp = chainEventLogArr[i][a];
                                chainEventLogArr[i][a] = chainEventLogArr[i][b];
                                chainEventLogArr[i][b] = atemp;
                            }
                        }
                    }
                }
            }
            csvWriter
                .writeRecords(chainEventLogArr[i])
                .then(()=> console.log('The CSV file was written successfully'));
        }
        } catch (err) {
            console.error(err);
        }
    }
}

function splitData(data){
    let startIndex = 2;
    let endIndex = 66;
    let dataLength = data.length;
    let returnStr = '';
    let dataIndex = 0;
    while(endIndex <= dataLength){
        if(dataLength / 64 > 7) {

            if(dataIndex == 0) {
                returnStr += `tempChainTopicEventData[j].data1 = "${parseInt('0x' + data.substring(startIndex, endIndex), 16)}";`;
            }
            if(dataIndex == 1) {
                returnStr += `tempChainTopicEventData[j].data2 = "${parseInt('0x' + data.substring(startIndex, endIndex), 16)}";`;
            }
            if(dataIndex == 2) {
                returnStr += `tempChainTopicEventData[j].data3 = "0x${data.substring(startIndex, endIndex).slice(24, 64)}";`;
            }
            if(dataIndex == 3) {
                returnStr += `tempChainTopicEventData[j].data4 = "${parseInt('0x' + data.substring(startIndex, endIndex), 16)}";`;
            }
            if(dataIndex == 4) {
                returnStr += `tempChainTopicEventData[j].data5 = "${parseInt('0x' + data.substring(startIndex, endIndex), 16)}";`;
            }
            if(dataIndex == 5) {
                returnStr += `tempChainTopicEventData[j].data6 = "${parseInt('0x' + data.substring(startIndex, endIndex), 16)}";`;
            }
            if(dataIndex == 6) {
                returnStr += `tempChainTopicEventData[j].data7 = "${parseInt('0x' + data.substring(startIndex, endIndex), 16)}";`;
            }
            if(dataIndex == 7) {
                returnStr += `tempChainTopicEventData[j].data8 = "${parseInt('0x' + data.substring(startIndex, endIndex), 16)}";`;
            }
        }else {
            if(dataIndex == 0) {
                returnStr += `tempChainTopicEventData[j].data1 = "0x${data.substring(startIndex, endIndex).slice(24, 64)}";`;
            }
            if(dataIndex == 1) {
                returnStr += `tempChainTopicEventData[j].data2 = "${parseInt('0x' + data.substring(startIndex, endIndex), 16)}";`;
            }
            if(dataIndex == 2) {
                returnStr += `tempChainTopicEventData[j].data3 = "${parseInt('0x' + data.substring(startIndex, endIndex), 16)}";`;
            }
            if(dataIndex == 3) {
                returnStr += `tempChainTopicEventData[j].data4 = "${parseInt('0x' + data.substring(startIndex, endIndex), 16)}";`;
            }
        }
        startIndex = endIndex;
        endIndex += 64;
        dataIndex ++;
    }
    return returnStr;
}