const Axios = require("axios");
const HtmlParser = require("node-html-parser");
const urls = {
    "domain": (url) => `https://pajak.go.id${url}`,
    "regulasi": (page = 1) => {
        page--; //fixing weird paging
        return `https://pajak.go.id/regulasi-page/${ page > 0 ? "?page=" + page : ""}`;
    }
}

var config = (process.env.USE_PROXY) ? {
    httpsAgent: agent
} : {}

function getRegulations(page = 1) {
    return Axios.get(urls.regulasi(page), config)
        .then(response => {
            let html = HtmlParser.parse(response.data);
            let regulationDom = html.querySelectorAll("table tr");
            let regulations = regulationDom.map(e => {
                    return {
                        links: [...e.querySelectorAll("td a").map(a => {
                            return {
                                text: a.text,
                                url: a.attributes.href,
                            }
                        })],
                        desc: [...e.querySelectorAll("td p").map(p => p.text)]
                    }
                })
                .map(e => {
                    return {
                        title: e.links[0] ? e.links[0].text : undefined,
                        url: e.links[0] ? e.links[0].url : undefined,
                        files: e.links.slice(1),
                        desc: e.desc.join("\n")
                    };
                })
                .filter(e => e.title)

            let page = Number(html.querySelector(".pager__item.is-active a").attributes.href.split("?page=")[1])
            page++; //fixing weird paging

            let totalPages = Number(html.querySelector(".pager__item.pager__item--last a").attributes.href.split("?page=")[1])
            totalPages++;

            return {
                regulations,
                page,
                totalPages
            };
        })
}

module.exports = {
    getRegulations
}