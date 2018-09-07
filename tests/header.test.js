const puppeteer = require('puppeteer')
const sessionFactory = require('./factories/sessionFactory')

let browser, page
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false
  })
  page = await browser.newPage()
  await page.goto('localhost:3000')
})

afterEach(async () => await browser.close())

test('We can launch chromium', async () => {
  const text = await page.$eval('a.brand-logo', ({ innerHTML }) => innerHTML)
  expect(text).toEqual('Blogster')
})

test('Clicking begins oauth process', async () => {
  await page.click('.right a')
  const url = await page.url()
  expect(url).toContain('accounts.google.com')
})

test.only('When signed in, shows logout button', async () => {
  const id = '5b8af69d5ba4e062efd55484'
  const { session, sig } = sessionFactory()

  await page.setCookie({ name: 'session', value: session }, { name: 'session.sig', value: sig })
  await page.goto('localhost:3000')

  const selector = 'a[href="/auth/logout"]'
  await page.waitFor(selector)
  const text = await page.$eval(selector, el => el.innerHTML)

  expect(text).toEqual('Logout')
})