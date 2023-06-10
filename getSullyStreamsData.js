async function fetchTexts(arr){
    let res = await Promise.all(arr.map(e => fetch(e)));
    return await Promise.all(res.map(async (e) => {
        let text = await e.text();
        return {
            text: text,
            url:e.url
        }
    }));    
}

async function getSullyStreamsData(params){
    var texts = await fetchTexts([`https://sullygnome.com/channel/${params?.channel_login}/30/streams`]);
    var channel_id = /(?<=PageInfo.{1,1000}?"id":)\d+/.exec(texts?.[0]?.text)?.[0]
    var res = await fetch(`https://sullygnome.com/api/tables/channeltables/streams/90/${channel_id}/%20/1/1/desc/0/100`);
    var d = await res.json();
    var parsed = d?.data?.map(r=> {
        return {
            ...{
                channel_login:r?.channelurl,
                stream_id:/(?<=stream\/)\d+/.exec(r?.streamUrl)?.[0] || r?.streamId,
                timestamp:new Date(r?.startDateTime).getTime(),
                timestamp_seconds: Math.floor(new Date(r?.startDateTime).getTime()/1000),
            },
            ...r
        }
    }).filter(r=> r.timestamp > (new Date().getTime() - (86400000*61))); /*filteres to last 60 days of streams*/
    console.log(parsed);
    return parsed;    
}
getSullyStreamsData({channel_login:'xQc'})
