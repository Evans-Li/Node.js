const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs')
const url = require('url')
const path = require('path');


const httpUrl = 'https://www.doutula.com/article/list/'

// 获取分类页
const getPageNumber = async (url) => {
  let res = await axios.get(url)
  let $ = cheerio.load(res.data)
  let btnLen = $('.pagination li').length;
  let maxPageNum = $('.pagination .page-item').eq(btnLen - 2).find('a').text()
  return  maxPageNum
}


//获取每一页中图片
const parsePage = async (pageurl, title) => {
  let res = await axios.get(pageurl)
  let $ = cheerio.load(res.data)
  $('.col-sm-9 .pic-content .artile_des img').each(async (index, el) => {
    let imgUrl = $(el).attr('src')
    let extName = path.extname(imgUrl)
    //创建图片写入路径
    let imgPath = `./imgs/${title}/${title}-${index}${extName}`
    //创建写入流
    let ws = fs.createWriteStream(imgPath)
    await axios.get(imgUrl, { responseType: 'stream' }).then((res) => {
      res.data.pipe(ws)
      console.log(`图片写入完成${imgPath}`);
      res.data.on('close', () => {
        ws.close()
      })
    })
  })
}

// 等待函数
 const awaitFn = async (milliSecondes)=>{
   return new Promise((resolve,reject)=>{
     setTimeout(() => {
       resolve('成功执行延迟函数: 延迟:' +milliSecondes)
     }, milliSecondes);
   })
 }

// 获取当前页的数据
const getPageList = async(page)=>{
  let pageUrl = `${httpUrl}?page=${page}`
  console.log('page',pageUrl)
  let res = await axios.get(pageUrl)
  let $ = cheerio.load(res.data)
  $('#home .col-sm-9>a').each( async(index, el) => {
    let title = $(el).find('.random_title').text()
    let reg = /(.*?)\d/igs
    title = reg.exec(title)[1]
    fs.mkdir('./imgs/' + title, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log(`创建目录成功 ./imgs/${title}`)
      }
    })

    let pageLink = $(el).attr('href')
    await awaitFn(2000*(index+1))
    // 开始调用写入图片方法
     parsePage(pageLink, title)
  })
}

const spider = async (url) => {
  const pageNum = await getPageNumber(url)
  console.log('spider',pageNum)
  for(let i=1;i<=pageNum;i++) {
    console.log('for',i)
    await awaitFn(2000*i)
    getPageList(i)
  }
}

spider(httpUrl)








