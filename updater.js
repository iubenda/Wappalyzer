/* 
* Works only in Unix like env 
* If you need bash-specific behavior, try out the {shell: 'path/to/bash'} option.
*/

const fs = require('fs')
const request = require('request')
const shell = require('shelljs')
const VERSION_LINK = 'https://unpkg.com/wappalyzer/package.json'
let meta = {}

const getLatestVer = request.get(VERSION_LINK)
    .on('error', function (err) {
        console.log(err)
    })
    .pipe(
        fs.createWriteStream('new-package.json')
    )

getLatestVer.on('finish', () => {
    fs.readFile('new-package.json', (err, data) => {
        
        meta = JSON.parse(data)
        console.log(`latest ver: ${meta.version}`)

        request.get(`https://registry.npmjs.org/wappalyzer/-/wappalyzer-${meta.version}.tgz`)
            .on('error', function (err) {
                console.log(err)
            })
            .pipe(
                fs.createWriteStream(`${meta.version}`)
            )
            .on('finish', () => {
                let branchName = `update-${meta.version}`
                let ver = `${meta.version}`

                shell.exec(`git checkout -b ${branchName}`, function(code, stdout, stderr) {
                    console.log('Exit code:', code)
                    console.log('Program output:', stdout)
                    console.log('Program stderr:', stderr)
                })

                shell.exec(`tar xzvf ${ver}`, function(code, stdout, stderr) {
                    console.log('Exit code:', code)
                    console.log('Program output:', stdout)
                    console.log('Program stderr:', stderr)
                })

                shell.cp('-Rf', 'package/*', '.')
                shell.rm('-rf', `package ${ver}`)

                shell.exec(`git add . && git commit -m "update ${ver}" && git checkout master`, function(code, stdout, stderr) {
                    console.log('Exit code:', code)
                    console.log('Program output:', stdout)
                    console.log('Program stderr:', stderr)
                })

                shell.exec(`git merge ${branchName}`, function(code, stdout, stderr) {
                    console.log('Exit code:', code)
                    console.log('Program output:', stdout)
                    console.log('Program stderr:', stderr)
                })

                shell.exec(`git branch -d ${branchName}`, function(code, stdout, stderr) {
                    console.log('Exit code:', code)
                    console.log('Program output:', stdout)
                    console.log('Program stderr:', stderr)
                })
                
            })
    })
})
