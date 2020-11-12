const puppeteer = require('puppeteer') 



let browser, page

beforeEach( async ()=>{
  // this function will be invoked before every test is executed

  // puppeteer is asyncronous
  browser = await puppeteer.launch({
    headless: false
  });
  // browser is an object that represent a running browser window

  page = await browser.newPage();
  // page rapresent a page in the browser

  await page.goto('localhost:3000') // url address that we want to navigate to

})

afterEach(async()=>{
  browser.close()
})


test("The header has the correct text", async ()=>{


  // getting the content of the header
  // using a css selector

  const text = await page.$eval('a.brand-logo', el=> el.innerHTML)

  // Chromium instance is a different process detatched from our code
  // Puppeter turns all the logic of the test into a string and pass it 
  // to the browser. 

  expect(text).toEqual('Blogster')
})