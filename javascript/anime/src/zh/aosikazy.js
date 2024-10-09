const mangayomiSources = [{
    "name": "奥斯卡资源站",
    "lang": "zh",
    "baseUrl": "https://aosikazy1.com",
    "apiUrl": "",
    "iconUrl": "https://aosikazy1.com/template/m1938pc3/image/favicon.ico",
    "typeSource": "single",
    "isManga": false,
    "isNsfw": true,
    "version": "0.0.1",
    "dateFormat": "",
    "dateFormatLocale": "",
    "pkgPath": "anime/src/zh/aosikazy.js"
}];

class DefaultExtension extends MProvider {
    dict = new Map([
        ["&nbsp;", " "],
        ["&quot;", '"'],
        ["&lt;", "<"],
        ["&gt;", ">"],
        ["&amp;", "&"],
        ["&sdot;", "·"],
    ]);
    text(content) {
        if (!content) return "";
        const str =
            [...content.matchAll(/>([^<]+?)</g)]
                .map((m) => m[1])
                .join("")
                .trim() || content;
        return str.replace(/&[a-z]+;/g, (c) => this.dict.get(c) || c);
    }
    async request(url) {
        const preference = new SharedPreferences();
        return (await new Client({ 'useDartHttpClient': true }).get(preference.get("url") + "/api.php/provide/vod?ac=detail" + url, { "Referer": preference.get("url") })).body;
    }
    getHeaders(url) {
        throw new Error("getHeaders not implemented");
    }
    async getPopular(page) {
        // let genres = [];
        // const gen = JSON.parse(await this.request("&ac=list"));
        // gen.class.forEach((e) => {
        //     genres.push({
        //         type_name: "SelectOption",
        //         value: e.type_id,
        //         name: e.type_name
        //     });
        // });
        // console.log(genres)
        const res = JSON.parse(await this.request(`&pg=${page}`));
        return {
            list: res.list.map((e) => ({
                link: "&ids=" + e.vod_id,
                imageUrl: e.vod_pic,
                name: e.vod_name
            })),
            hasNextPage: true
        };
    }
    async getLatestUpdates(page) {
        const h = (new Date().getUTCHours() + 9) % 24;
        const res = JSON.parse(await this.request(`&pg=${page}&h=${h || 24}`));
        return {
            list: res.list.map((e) => ({
                link: "&ids=" + e.vod_id,
                imageUrl: e.vod_pic,
                name: e.vod_name
            })),
            hasNextPage: true
        };
    }
    async search(query, page, filters) {
        var categories;
        for (const filter of filters) {
            if (filter["type"] == "categories") {
                categories = filter["values"][filter["state"]]["value"];
            }
        }
        const res = JSON.parse(await this.request(`&wd=${query}&t=${categories ?? ""}&pg=${page}`));
        return {
            list: res.list.map((e) => ({
                link: "&ids=" + e.vod_id,
                imageUrl: e.vod_pic,
                name: e.vod_name
            })),
            hasNextPage: true
        };
    }
    async getDetail(url) {
        let desc = "无";
        const anime = JSON.parse(await this.request(url)).list[0];
        const blurb = this.text(anime.vod_blurb);
        const content = this.text(anime.vod_content);
        desc = desc.length < blurb?.length ? blurb : desc;
        desc = desc.length < content.length ? content : desc;
        const urls = anime.vod_play_url
            .split("#")
            .filter((e) => e)
            .map((e) => {
                const s = e.split("$");
                return { name: s[0], url: s[1] };
            });
        return {
            name: anime.vod_name,
            imageUrl: anime.vod_pic,
            description: desc,
            episodes: urls
        };
    }
    // For anime episode video list
    async getVideoList(url) {
        return [{
            url: url,
            originalUrl: url,
            quality: "HLS"
        }];
    }
    // For manga chapter pages
    async getPageList() {
        throw new Error("getPageList not implemented");
    }
    getFilterList() {
        return [{
            type: "categories",
            name: "Categories",
            type_name: "SelectFilter",
            values: [
                // { type_name: "SelectOption", value: "1", name: "电影" },
                // { type_name: "SelectOption", value: "2", name: "连续剧" },
                // { type_name: "SelectOption", value: "3", name: "综艺" },
                { type_name: "SelectOption", value: "", name: "All" },
                { type_name: "SelectOption", value: "20", name: "Domestic Video" },
                { type_name: "SelectOption", value: "21", name: "Chinese subtitles" },
                { type_name: "SelectOption", value: "22", name: "Domestic Media" },
                { type_name: "SelectOption", value: "23", name: "Censored JAV" },
                { type_name: "SelectOption", value: "24", name: "Uncensored JAV" },
                { type_name: "SelectOption", value: "25", name: "Uncensored US/EU" },
                { type_name: "SelectOption", value: "26", name: "Rape and Incest" },
                { type_name: "SelectOption", value: "27", name: "Uniform temptation" },
                { type_name: "SelectOption", value: "28", name: "Domestic anchor" },
                { type_name: "SelectOption", value: "29", name: "Passion Anime" },
                { type_name: "SelectOption", value: "30", name: "Celebrity Face Swap" },
                { type_name: "SelectOption", value: "31", name: "Douyin video" },
                { type_name: "SelectOption", value: "32", name: "Actress Star" },
                { type_name: "SelectOption", value: "33", name: "Video Zone 1" },
                { type_name: "SelectOption", value: "34", name: "Video Zone 2" },
                { type_name: "SelectOption", value: "35", name: "Internet exposure of black material" },
                { type_name: "SelectOption", value: "36", name: "Video Zone 3" },
                { type_name: "SelectOption", value: "37", name: "Ethics Level 3" },
                { type_name: "SelectOption", value: "38", name: "AV Commentary" },
                { type_name: "SelectOption", value: "39", name: "SM Training" },
                { type_name: "SelectOption", value: "40", name: "Loli girl" },
                { type_name: "SelectOption", value: "41", name: "Black" },
                { type_name: "SelectOption", value: "42", name: "Lesbian" },
                { type_name: "SelectOption", value: "43", name: "Internet celebrity headlines" },
                { type_name: "SelectOption", value: "44", name: "Video Zone 4" },
                { type_name: "SelectOption", value: "45", name: "Shemale Series" },
                { type_name: "SelectOption", value: "46", name: "Korean anchor" },
                { type_name: "SelectOption", value: "47", name: "VR Perspective" }
            ]
        }];
    }
    getSourcePreferences() {
        return [
            {
                "key": "url",
                "listPreference": {
                    "title": "Website Url",
                    "summary": "",
                    "valueIndex": 0,
                    "entries": ["aosikazy1", "aosikazy2", "aosikazy3", "aosikazy4", "aosikazy5", "aosikazy6", "aosikazy7", "aosikazy8", "aosikazy9", "aosikazy10"],
                    "entryValues": ["https://aosikazy1.com", "https://aosikazy2.com", "https://aosikazy3.com", "https://aosikazy4.com", "https://aosikazy5.com", "https://aosikazy6.com", "https://aosikazy7.com", "https://aosikazy8.com", "https://aosikazy9.com", "https://aosikazy10.com"],
                }
            }
        ];
    }
}
