const { showAlertDialog } = require('dialogs');


async function alert(e: any) {
    await showAlertDialog("错误", { content: e.message,type:"overlay" });
}

import {run,breathCalFireInTheSandRun} from "@/main";


async function main() {
    await breathCalFireInTheSandRun()
}

main().catch(async e => {
    console.error(e)
    await alert(e)
})
