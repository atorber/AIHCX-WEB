function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
async function getUserInfo(keyword) {
    var body = {
      "keyword": keyword,
      "pageNo": 1,
      "pageSize": 10
    }
    
    var resource = await fetch('https://eop.baidu-int.com/api/crm2/home/customer/search', {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  
    const userRes = await resource.json()
    console.log(userRes)
    return {
        keyword: keyword,
        name: userRes.page.result[0].name,
        type: userRes.page.result[0].type,
    }
  }
  const listString =
  ``
  
  // 将listString转换成数组
  const keywords = listString.split('\n')
  let res_list = []
  
  // const keywords = ['01949c0e599440d085254a6a23fbfe26','0d0120f91f694c9cb8d0a14c935fdc0c'];
  // 批量请求getUserInfo()，每个请求之间50ms的延时
  for (let i = 0; i < keywords.length; i++) {
    const res = await getUserInfo(keywords[i])
    if (res.type === '企业客户') {
        res_list.push(`${res.keyword},${res.name}`)
    }
    console.log(`${i+1}/${keywords.length}`)
    await new Promise(resolve => setTimeout(resolve, random(10, 50)))
  }
  
  console.log(res_list.join('\n'));