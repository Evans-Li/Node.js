const axios = require('axios');
const fs = require('fs')
const path = require('path')

const url = 'http://www.app-echo.com/api/recommend/sound-day?page='

const getPage = async (pageUrl) => {
  let res = await axios.get(pageUrl)
  await res.data.list.forEach(async (item, index) => {
    let source = item.sound.source;
    let filepath = path.parse(source).name
    // 间隔写入时间
    await awaitFn(500*index)
    await downLoadMusic(filepath, source)
  })
}

// 下载 
const downLoadMusic = async (name, source) => {
  let res = await axios.get(source, { responseType: 'stream' })
  let ws = fs.createWriteStream('./music/' + name + '.mp3')
  res.data.pipe(ws)
  console.log(`${name} 写入完成`)
  res.data.on('close', () => {
    ws.close()
  })
}

//等待函数
const awaitFn = async (milliSecondes) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('延迟' + milliSecondes + '秒')
    }, milliSecondes)
  })
}

const spider = async () => {
  let down = true
  let n = 1;
  while (down) {
    let pageUrl = url + n
    let page = await axios.get(pageUrl)
    let len = page.data.list.length
    if (!len) {
      down = false
      return;
    }
    await getPage(pageUrl)
    await awaitFn(5000) // 请求间隔时间
    console.log(n)
    n++;
  }
}

spider()
