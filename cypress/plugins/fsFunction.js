/// <reference types="cypress" />
const fsPromises = require('fs').promises;
const fs = require('fs');
// const path = require('path');

const clearAllFilesInFolder = (pathFolder) => {
    const path = "";
    fsPromises.readdir(pathFolder, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
            fsPromises.unlink(pathFolder+file, err => {
                if (err) throw err;
            });
        }
    });
    return path
}

const checkFileExist = (pathFolder) => {
    return fs.existsSync(pathFolder);
}

const getFileNameInFolder = (pathFolder) => {
    const fileNameInFolder = fs.readdirSync(pathFolder);
    
    // const files = [];
    // fs.readdirSync(pathFolder).forEach((file) => {
    //     // you may want to filter these by extension, etc. to make sure they are JSON files
    //     const json = fs.readFileSync(pathFolder + file);
    //     files.push(json);
    //     // return json
    // })

    // fs.writeFile("cypress/logs/result.json", files);
    // return errorObjectArray ;
      
    return fileNameInFolder;
}

const copyFileFromFolderToFolder = ({moveFromFolder, moveToFolder, fileNameFrom, fileNameTo}) => {
    
    console.log("copyFileFromFolderToFolder")

    // Create Screenshot Folder (img) in testReport Folder
    try {
    if (!fs.existsSync(moveToFolder)) {
        
        fs.mkdirSync(moveToFolder) 
        console.log("No folder")
        
    } 
    } catch (err) {
        console.error(err)
    }

    fs.copyFile(`${moveFromFolder}/${fileNameFrom}`, `${moveToFolder}/${fileNameTo}`, (err) => {
        if (err) throw err;
        console.log('File was copied From' + moveFromFolder + ' to ' + moveToFolder);
    });


    return "Suscess";
}
 
module.exports = {
    clearAllFilesInFolder,
    getFileNameInFolder,
    checkFileExist,
    copyFileFromFolderToFolder
}