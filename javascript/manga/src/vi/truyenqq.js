const mangayomiSources = [{
    "name": "TruyenQQ",
    "lang": "vi",
    "baseUrl": "https://truyenqqto.com",
    "apiUrl": "",
    "iconUrl": "https://raw.githubusercontent.com/cgcnl/mangayomi-extensions/main/javascript/icon/vi.truyenqq.png",
    "typeSource": "single",
    "itemType": 0,
    "isNsfw": false,
    "hasCloudflare": true,
    "version": "0.0.1",
    "pkgPath": "manga/src/vi/truyenqq.js"
}];

class DefaultExtension extends MProvider {
    constructor() {
        super();
        this.client = new Client();
    }

    getHeaders(url) {
        return {
            "Referer": `${this.source.baseUrl}/`,
            'User-Agent':
                "Tachiyomi Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:110.0) Gecko/20100101 Firefox/110.0"
        };
    }

    async request(slug) {
        var url = `${this.source.baseUrl}${slug}`
        var res = await this.client.get(url, this.getHeaders());
        return new Document(res.body);
    }

    parseMangaList(doc) {
        var list = [];
        var mangaElements = doc.select("ul.grid > li")
        for (var manga of mangaElements) {
            var details = manga.selectFirst('.book_info .qtip a');
            if (details.getHref.indexOf("/truyen-tranh/") < 0) continue;

            var link = details.getHref;
            var name = details.text;

            var imageUrl = manga.selectFirst(".book_avatar img").getSrc;

            list.push({ name, imageUrl, link });
        }
        var hasNextPage = doc.selectFirst(".page_redirect > a:nth-last-child(2) > p:not(.active)")?.text != null;
        return { list, hasNextPage }
    }

    async getMangaList(slug, page = 0) {
        var page = parseInt(page)

        slug = `${slug}/trang-${page}.html`;

        var doc = await this.request(slug);
        return this.parseMangaList(doc);
    }

    async getPopular(page) {
        return await this.getMangaList("/truyen-yeu-thich", page)
    }
    get supportsLatest() {
        throw new Error("supportsLatest not implemented");
    }
    async getLatestUpdates(page) {
        return await this.getMangaList("/truyen-moi-cap-nhat", page)
    }

    async search(query, page, filters) {
        var slug = "";
        if (query !== "") {
            slug = `/tim-kiem/trang-${page}.html?q=${query}`
        } else {
            var category = ""
            var notcategory = ""
            for (var filter_ of filters[0].state) {
                if (filter_.state === 1)
                    if (category === "")
                        category = filter_.value
                    else
                        category += `,${filter_.value}`
                else if (filter_.state === 2)
                    if (notcategory === "")
                        notcategory = filter_.value
                    else
                        notcategory += `,${filter_.value}`
            }
            var country = filters[1].values[filters[1].state].value
            var status = filters[2].values[filters[2].state].value
            var minchapter = filters[3].values[filters[3].state].value
            var sort = filters[4].values[filters[4].state].value

            slug = `/tim-kiem-nang-cao/trang-${page}.html?category=${category}&notcategory=${notcategory}&country=${country}&status=${status}&minchapter=${minchapter}&sort=${sort}`
        }
        var doc = await this.request(slug);
        return this.parseMangaList(doc)
    }

    textWithLinebreaks(element) {
        element.select("p").map(e => e.prepend("\\n"))
        element.select("br").map(e => e.prepend("\\n"))
        return element.text.replace("\\n", "\n").replace("\n ", "\n")
    }

    async getDetail(slug) {
        var link = `${this.source.baseUrl}${slug}`
        var doc = await this.request(slug);

        var info = doc.selectFirst(".list-info");

        var title = doc.selectFirst("h1").text;
        var author = info.select(".org").map(e => e.text).join(", ");
        var genre = info.select(".list01 li").map(e => e.text);
        var description = doc.selectFirst(".story-detail-info").text.trim();
        var imageUrl = doc.selectFirst("img[itemprop=image]").getSrc;
        var status = 0;
        var statusText = info.selectFirst(".status > p:last-child").text;
        if (statusText === "Đang Cập Nhật")
            status = 0
        else if (statusText === "Hoàn Thành")
            status = 1
        else
            status = -1

        var chapters = []

        var chapList = doc.select("div.works-chapter-list div.works-chapter-item");
        for (var chap of chapList) {
            var name = chap.selectFirst("a").text.trim();
            var dateUploadStr = chap.selectFirst(".time-chap").text.trim();
            var dateParts = dateUploadStr.split("/");
            var dateUpload = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]).valueOf().toString();
            var url = chap.selectFirst("a").getHref;
            chapters.push({ name, url, dateUpload})
        }
        return { name: title, description, link, imageUrl, author, genre, status, chapters }

    }
    // For novel html content
    async getHtmlContent(url) {
        throw new Error("getHtmlContent not implemented");
    }
    // Clean html up for reader
    async cleanHtmlContent(html) {
        throw new Error("cleanHtmlContent not implemented");
    }
    // For anime episode video list
    async getVideoList(url) {
        throw new Error("getVideoList not implemented");
    }
    // For manga chapter pages
    async getPageList(slug) {
        var doc = await this.request(slug);

        var urls = [];

        doc.select(".page-chapter img").forEach(page => urls.push({url: page.attr("src"), headers: this.getHeaders()}))

        return urls
    }

    getFilterList() {
        return [
            {
                type_name: "GroupFilter",
                name: "Genres",
                state: [
                    ["Action", "26"],
                    ["Adventure", "27"],
                    ["Anime", "62"],
                    ["Chuyển Sinh", "91"],
                    ["Cổ Đại", "90"],
                    ["Comedy", "28"],
                    ["Comic", "60"],
                    ["Demons", "99"],
                    ["Detective", "100"],
                    ["Doujinshi", "96"],
                    ["Drama", "29"],
                    ["Fantasy", "30"],
                    ["Gender Bender", "45"],
                    ["Harem", "47"],
                    ["Historical", "51"],
                    ["Horror", "44"],
                    ["Huyền Huyễn", "468"],
                    ["Isekai", "85"],
                    ["Josei", "54"],
                    ["Mafia", "69"],
                    ["Magic", "58"],
                    ["Manhua", "35"],
                    ["Manhwa", "49"],
                    ["Martial Arts", "41"],
                    ["Military", "101"],
                    ["Mystery", "39"],
                    ["Ngôn Tình", "87"],
                    ["One shot", "95"],
                    ["Psychological", "40"],
                    ["Romance", "36"],
                    ["School Life", "37"],
                    ["Sci-fi", "43"],
                    ["Seinen", "42"],
                    ["Shoujo", "38"],
                    ["Shoujo Ai", "98"],
                    ["Shounen", "31"],
                    ["Shounen Ai", "86"],
                    ["Slice of life", "46"],
                    ["Sports", "57"],
                    ["Supernatural", "32"],
                    ["Tragedy", "52"],
                    ["Trọng Sinh", "82"],
                    ["Truyện Màu", "92"],
                    ["Webtoon", "55"],
                    ["Xuyên Không", "88"]
                ].map(x => ({ type_name: 'TriState', name: x[0], value: x[1] }))
            },
            {
                type_name: "SelectFilter",
                name: "Country",
                state: 0,
                values: [
                    ["All", "0"],
                    ["China", "1"],
                    ["Vietnam", "2"],
                    ["Korea", "3"],
                    ["Japan", "4"],
                    ["USA", "5"]
                ].map(x => ({ type_name: 'SelectOption', name: x[0], value: x[1] }))
            },
            {
                type_name: "SelectFilter",
                name: "Status",
                state: 0,
                values: [
                    ["All", "-1"],
                    ["Ongoing", "0"],
                    ["Complete", "2"]
                ].map(x => ({ type_name: 'SelectOption', name: x[0], value: x[1] }))
            },
            {
                type_name: "SelectFilter",
                name: "Number of chapters",
                state: 0,
                values: [
                    ["> 0", "0"],
                    [">= 100", "100"],
                    [">= 200", "200"],
                    [">= 300", "300"],
                    [">= 400", "400"],
                    [">= 500", "500"],
                ].map(x => ({ type_name: 'SelectOption', name: x[0], value: x[1] }))
            },
            {
                type_name: "SelectFilter",
                name: "Sort",
                state: 0,
                values: [
                    ["Recently Added - Desc", "0"],
                    ["Recently Added - Asc", "1"],
                    ["Latest Updates - Desc", "2"],
                    ["Latest Updates - Asc", "3"],
                    ["Views - Desc", "4"],
                    ["Views - Asc", "5"]
                ].map(x => ({ type_name: 'SelectOption', name: x[0], value: x[1] }))
            }
        ]
    }
    getSourcePreferences() {
        throw new Error("getSourcePreferences not implemented");
    }
}
