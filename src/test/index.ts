import {test} from "@/test/toastTest";
import {testInit} from "@/test/commonUtilTest";
import {testHrOcr} from "@/test/ocrUtilTest";
const { showAlertDialog } = require('dialogs');

async function alert(e: any) {
    await showAlertDialog("错误", { content: e.message,type:"overlay" });
}

import {run} from "@/main";
import {showToast} from "toast";

async function main() {
    await run()
}

main().catch(e =>{
    console.error(e)
    alert(e)
})
