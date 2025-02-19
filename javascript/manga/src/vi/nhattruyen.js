const mangayomiSources = [{
    "name": "NhatTruyen",
    "lang": "vi",
    "baseUrl": "https://nhattruyenv.com",
    "apiUrl": "",
    "iconUrl": "https://raw.githubusercontent.com/cgcnl/mangayomi-extensions/main/javascript/icon/vi.nhattruyen.png",
    "typeSource": "single",
    "itemType": 0,
    "isNsfw": false,
    "hasCloudflare": false,
    "version": "0.0.1",
    "pkgPath": "manga/src/vi/nhattruyen.js"
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

    async requestJson(slug) {
        var url = `${this.source.baseUrl}${slug}`
        var res = await this.client.get(url, this.getHeaders());
        return JSON.parse(res.body);
    }

    parseMangaList(doc) {
        var list = [];
        var mangaElements = doc.select("div#ctl00_divCenter div.items div.item")
        for (var manga of mangaElements) {
            var details = manga.selectFirst('a.jtip');

            var link = this.getUrlWithoutDomain(details.getHref);
            var name = details.text.trim();

            var imageUrl = this.imageOrNull(manga.selectFirst("div.image img"));

            list.push({ name, imageUrl, link });
        }
        var hasNextPage = doc.selectFirst(".page-item:last-child > a")?.text != null;
        return { list, hasNextPage }
    }

    async getMangaList(slug, page = 0) {
        var page = parseInt(page)

        slug = `${slug}?page=${page}`;

        var doc = await this.request(slug);
        return this.parseMangaList(doc);
    }

    async getPopular(page) {
        return await this.getMangaList("/truyen-tranh-hot", page)
    }
    get supportsLatest() {
        throw new Error("supportsLatest not implemented");
    }
    async getLatestUpdates(page) {
        return await this.getMangaList("/", page)
    }

    async search(query, page, filters) {
        let slug = "/tim-truyen";
        if (query !== "") {
            slug = slug + `?keyword=${query}&page=${page}`;
        } else {
            const category = filters[0].values[filters[0].state].value;
            if (category !== "")
                slug = slug + "/" + category;
            slug = slug + `?page=${page}`;
            if (filters[1].state !== 0) {
                const status = filters[1].values[filters[1].state].value;
                slug = slug + `&status=${status}`;
            }
            if (filters[2].state !== 0) {
                const sort = filters[2].values[filters[2].state].value;
                slug = slug + `&sort=${sort}`;
            }
        }
        const doc = await this.request(slug);
        return this.parseMangaList(doc);
    }

    async getDetail(slug) {
        var link = `${this.source.baseUrl}${slug}`
        var doc = await this.request(slug);

        var info = doc.selectFirst("article#item-detail");

        var title = info.selectFirst("h1").text;
        var author = info.selectFirst("li.author p.col-xs-8").text;
        var genre = info.select("li.kind p.col-xs-8 a").map(e => e.text);
        var description = info.selectFirst("div.detail-content").text.trim();
        var otherNames = info.selectFirst("h2.other-name").text;
        if (otherNames)
            description = description + "\n\nOTHER NAME: " + otherNames;
        var imageUrl = this.imageOrNull(info.selectFirst("div.col-image img"));
        var statusText = info.selectFirst(".status > p:last-child").text;
        var status = this.stringToStatus(statusText);

        var chapters = await this.getChapters(slug);

        return { name: title, description, link, imageUrl, author, genre, status, chapters }
    }

    async getChapters(slug) {
        var req_slug = slug.replace("/truyen-tranh/", "/Comic/Services/ComicService.asmx/ChapterList?slug=");
        var json = await this.requestJson(req_slug);
        return json.data.map(chap => {
            var name = chap.chapter_name;
            var url = slug + "/" + chap.chapter_slug;
            var dateUpload = new Date(chap.reported_at).valueOf().toString();
            return {name, url, dateUpload}
        });
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

        doc.select("div.page-chapter > img, li.blocks-gallery-item img").forEach(page => urls.push({url: this.imageOrNull(page), headers: this.getHeaders()}))

        return urls
    }

    hasValidAttr(element, attr) {
        const regex = RegExp('https?://.*', 'i');
        return !!(element.attr(attr) && regex.test(element.attr(attr)));

    }

    imageOrNull(element) {
        if (this.hasValidAttr(element, 'data-original')) {
            return element.attr('data-original');
        }
        if (this.hasValidAttr(element, 'data-src')) {
            return element.attr('data-src');
        }
        if (this.hasValidAttr(element, 'src')) {
            return element.attr('src');
        }
        return null;
    }

    stringToStatus(str) {
        const ongoingWords = ["Ongoing", "Updating", "Đang tiến hành", "Đang cập nhật", "連載中"];
        const completedWords = ["Complete", "Completed", "Hoàn thành", "Đã hoàn thành", "完結済み"];

        if (ongoingWords.some(word => str.toLowerCase().includes(word.toLowerCase()))) {
            return 0;
        }
        if (completedWords.some(word => str.toLowerCase().includes(word.toLowerCase()))) {
            return 1;
        }
        return -1;
    }

    getUrlWithoutDomain(url) {
        return url.replace(this.source.baseUrl, '');

    }

    getFilterList() {
        return [
            {
                type_name: "SelectFilter",
                name: "Genres",
                state: 0,
                values: [
                    ["Tất cả", ""],
                    ["Action", "action-95"],
                    ["Adventure", "adventure"],
                    ["Anime", "anime"],
                    ["Chuyển Sinh", "chuyen-sinh-2130"],
                    ["Comedy", "comedy-99"],
                    ["Comic", "comic"],
                    ["Cooking", "cooking"],
                    ["Cổ Đại", "co-dai-207"],
                    ["Doujinshi", "doujinshi"],
                    ["Drama", "drama-103"],
                    ["Đam Mỹ", "dam-my"],
                    ["Fantasy", "fantasy-105"],
                    ["Gender Bender", "gender-bender"],
                    ["Historical", "historical"],
                    ["Horror", "horror"],
                    ["Live action", "live-action"],
                    ["Manga", "manga-112"],
                    ["Manhua", "manhua"],
                    ["Manhwa", "manhwa-11400"],
                    ["Martial Arts", "martial-arts"],
                    ["Mecha", "mecha-117"],
                    ["Mystery", "mystery"],
                    ["Ngôn Tình", "ngon-tinh"],
                    ["Psychological", "psychological"],
                    ["Romance", "romance-121"],
                    ["School Life", "school-life"],
                    ["Sci-fi", "sci-fi"],
                    ["Shoujo", "shoujo"],
                    ["Shoujo Ai", "shoujo-ai-126"],
                    ["Shounen", "shounen-127"],
                    ["Shounen Ai", "shounen-ai"],
                    ["Slice of Life", "slice-of-life"],
                    ["Sports", "sports"],
                    ["Supernatural", "supernatural"],
                    ["Thiếu Nhi", "thieu-nhi"],
                    ["Tragedy", "tragedy-136"],
                    ["Trinh Thám", "trinh-tham"],
                    ["Truyện scan", "truyen-scan"],
                    ["Truyện Màu", "truyen-mau"],
                    ["Webtoon", "webtoon"],
                    ["Xuyên Không", "xuyen-khong-205"],
                    ["Tu Tiên", "tu-tien"],
                ].map(x => ({ type_name: 'SelectOption', name: x[0], value: x[1] }))
            },
            {
                type_name: "SelectFilter",
                name: "Status",
                state: 0,
                values: [
                    ["Tất cả", "-1"],
                    ["Hoàn thành", "2"],
                    ["Đang tiến hành", "1"]
                ].map(x => ({ type_name: 'SelectOption', name: x[0], value: x[1] }))
            },
            {
                type_name: "SelectFilter",
                name: "Sort",
                state: 0,
                values: [
                    ["Ngày cập nhật", ""],
                    ["Truyện mới", "15"],
                    ["Top all", "10"],
                    ["Top tháng", "11"],
                    ["Top tuần", "12"],
                    ["Top ngày", "13"],
                    ["Theo dõi", "20"],
                    ["Bình luận", "25"],
                    ["Số chapter", "30"],
                    ["Top Follow", "19"],
                ].map(x => ({ type_name: 'SelectOption', name: x[0], value: x[1] }))
            }
        ]
    }
    getSourcePreferences() {
        throw new Error("getSourcePreferences not implemented");
    }
}
