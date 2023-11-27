import './link-resolver.js';
import './text-rewriter.js';
import './dino.css.js';
import './dino.js';
import './host-bridge.js';
import './highlight.js';
let hostTarget = "docs.deno.com";
let docsTarget = "docs.deno.com";
const skipRequestHeaders = [
    'x-forwarded-for'
];
const skipResponseHeaders = [
    "connection",
    "content-length",
    'x-frame-options',
    'x-content-type-options'
];
let injects = globalThis['link-resolver-import'] + globalThis['text-rewriter'] + globalThis.dinoCSS + globalThis.dino + globalThis['host-bridge'] + globalThis.highlight;
export default async function(req) {
    try {
        if (req.method == "OPTIONS" || req.url == '*') {
            return new Response("", {
                headers: {
                    Allow: "OPTIONS, GET, HEAD, POST"
                }
            });
        }
        let reqURL = req.url.replace('_root/', '').replace('_root', '');
        let url = reqURL.split('/');
        let flatURL = reqURL.split('?')[0].split('#')[0];
        let localhost = url[2];
        url[2] = hostTarget;
        if (reqURL.includes('hostname=')) {
            url[2] = reqURL.split('hostname=')[1].split('&')[0].split('#')[0];
        }
        if (reqURL.includes('/manual')) {
            url[2] = docsTarget;
        }
        let request = new Request(url.join("/"));
        for(let header in request.headers.keys){
            if (header) {
                if (skipRequestHeaders.includes(header.toLowerCase())) {
                    continue;
                }
                request.headers.set(header, request.headers.get(header).toString().replace(localhost, hostTarget));
            }
        }
        //request = addCacheHeaders(request);
        let res = await fetch(request);
        let body = "";
        let htmlFlag = false;
        if (!res.headers.has('Content-Type') || !res.headers.get('content-type')) {
            body = await res.arrayBuffer();
            const typedArray = new Uint8Array(body);
            let array = [
                ...typedArray
            ];
            array.length = 50;
            //console.log(String.fromCharCode(...array));
            htmlFlag = true;
        } else {
            let ct = res.headers.get('content-type').toLowerCase();
            //console.log(ct);
            if (ct.includes('text')) {
                let headText = injects;
                body = (await res.text()).replaceAll("delete globalThis.Prism", "").replace('<head>', '<head>' + headText).replace('</head>', headText + '</head>');
                if (body.includes('<html') || ct.includes('plain')) {
                    htmlFlag = true;
                }
            } else if (flatURL.endsWith('.js')) {
                body = (await res.text()).replaceAll(hostTarget, localhost);
            } else if (res.body) {
                body = await res.arrayBuffer();
                const typedArray = new Uint8Array(body);
                let array = [
                    ...typedArray
                ];
                array.length = 50;
            //console.log(String.fromCharCode(...array));
            }
        }
        let response = new Response(body);
        for(let header in response.headers.keys){
            if (header) {
                if (skipResponseHeaders.includes(header.toLowerCase())) {
                    continue;
                }
                request.headers.set(header, response.headers.get(header).toString().replace(hostTarget, localhost));
            }
        }
        if (htmlFlag) {
            response.headers.set('Content-Type', 'text/html');
        }
        if (!response.headers.get('Content-Type')) {
            response.headers.set('Content-Type', 'text/html');
        }
        if (response.headers.get('Content-Type').toLowerCase().includes('plain')) {
            response.headers.set('Content-Type', 'text/html');
        }
        if (flatURL.endsWith('.js')) {
            response.headers.set('Content-Type', 'text/javascript');
        }
        if (flatURL.endsWith('.css')) {
            response.headers.set('Content-Type', 'text/css');
        }
        if (flatURL.endsWith('.svg')) {
            response.headers.set('Content-Type', 'image/svg+xml');
        }
        if (flatURL.endsWith('.png')) {
            response.headers.set('Content-Type', 'image/png');
        }
        if (flatURL.endsWith('.jpg') || flatURL.endsWith('.jpeg')) {
            response.headers.set('Content-Type', 'image/jpeg');
        }
        //console.log(response.headers.get('content-type'));
        //response = addCacheHeaders(response);
        return response;
    } catch (e) {
        console.log(e);
        return new Response('Error: ' + e, {
            status: 500
        });
    }
}
function addCacheHeaders(re) {
    re.headers.set("CDN-Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Surrogate-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    re.headers.set("Vercel-CDN-Cache-Control", "public, max-age=96400, s-max-age=96400, stale-if-error=31535000, stale-while-revalidate=31535000");
    return re;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvZG9jcy1kZWluby9hcGkvaGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vbGluay1yZXNvbHZlci5qcyc7XG5pbXBvcnQgJy4vdGV4dC1yZXdyaXRlci5qcyc7XG5pbXBvcnQgJy4vZGluby5jc3MuanMnO1xuaW1wb3J0ICcuL2Rpbm8uanMnO1xuaW1wb3J0ICcuL2hvc3QtYnJpZGdlLmpzJztcbmltcG9ydCAnLi9oaWdobGlnaHQuanMnO1xubGV0IGhvc3RUYXJnZXQgPSBcImRvY3MuZGVuby5jb21cIjtcbmxldCBkb2NzVGFyZ2V0ID0gXCJkb2NzLmRlbm8uY29tXCI7XG5cbmNvbnN0IHNraXBSZXF1ZXN0SGVhZGVyczogc3RyaW5nW10gPSBbJ3gtZm9yd2FyZGVkLWZvciddO1xuY29uc3Qgc2tpcFJlc3BvbnNlSGVhZGVycyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY29ubmVjdGlvblwiLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb250ZW50LWxlbmd0aFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAneC1mcmFtZS1vcHRpb25zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gtY29udGVudC10eXBlLW9wdGlvbnMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcblxubGV0IGluamVjdHMgPSBnbG9iYWxUaGlzWydsaW5rLXJlc29sdmVyLWltcG9ydCddK1xuICBnbG9iYWxUaGlzWyd0ZXh0LXJld3JpdGVyJ10rXG4gIGdsb2JhbFRoaXMuZGlub0NTUysgXG4gIGdsb2JhbFRoaXMuZGlubytcbiAgZ2xvYmFsVGhpc1snaG9zdC1icmlkZ2UnXStcbiAgZ2xvYmFsVGhpcy5oaWdobGlnaHQ7XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIChyZXE6IFJlcXVlc3QpIHtcbiAgdHJ5e1xuICBpZiAoKHJlcS5tZXRob2QgPT0gXCJPUFRJT05TXCIpfHwocmVxLnVybD09JyonKSkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXCJcIix7aGVhZGVyczp7QWxsb3c6IFwiT1BUSU9OUywgR0VULCBIRUFELCBQT1NUXCJ9fSk7XG4gIH1cbiAgbGV0IHJlcVVSTCA9IHJlcS51cmwucmVwbGFjZSgnX3Jvb3QvJywnJykucmVwbGFjZSgnX3Jvb3QnLCcnKTtcbiAgbGV0IHVybD1yZXFVUkwuc3BsaXQoJy8nKTtcbiAgbGV0IGZsYXRVUkwgPSByZXFVUkwuc3BsaXQoJz8nKVswXS5zcGxpdCgnIycpWzBdO1xuICBsZXQgbG9jYWxob3N0ID0gdXJsWzJdO1xuICB1cmxbMl0gPSBob3N0VGFyZ2V0O1xuICBpZihyZXFVUkwuaW5jbHVkZXMoJ2hvc3RuYW1lPScpKXtcbiAgICB1cmxbMl09cmVxVVJMLnNwbGl0KCdob3N0bmFtZT0nKVsxXS5zcGxpdCgnJicpWzBdLnNwbGl0KCcjJylbMF07XG4gIH1cbiAgaWYocmVxVVJMLmluY2x1ZGVzKCcvbWFudWFsJykpe1xuICAgIHVybFsyXT1kb2NzVGFyZ2V0O1xuICB9XG4gIGxldCByZXF1ZXN0ID0gbmV3IFJlcXVlc3QodXJsLmpvaW4oXCIvXCIpKTtcbiAgZm9yIChsZXQgaGVhZGVyIGluIHJlcXVlc3QuaGVhZGVycy5rZXlzKSB7XG4gICAgaWYgKGhlYWRlcikge1xuICAgICAgaWYgKHNraXBSZXF1ZXN0SGVhZGVycy5pbmNsdWRlcyhoZWFkZXIudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KFxuICAgICAgICBoZWFkZXIsXG4gICAgICAgIHJlcXVlc3QuaGVhZGVycy5nZXQoaGVhZGVyKS50b1N0cmluZygpLnJlcGxhY2UobG9jYWxob3N0LCBob3N0VGFyZ2V0KSxcbiAgICAgICk7XG4gICAgfVxuICB9XG4gIC8vcmVxdWVzdCA9IGFkZENhY2hlSGVhZGVycyhyZXF1ZXN0KTtcbiAgbGV0IHJlcyA9IGF3YWl0IGZldGNoKHJlcXVlc3QpO1xuXG4gIGxldCBib2R5ID0gXCJcIjtcbiAgbGV0IGh0bWxGbGFnID0gZmFsc2U7XG4gIGlmKCghcmVzLmhlYWRlcnMuaGFzKCdDb250ZW50LVR5cGUnKSl8fCghcmVzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkpe1xuICAgIGJvZHkgPSBhd2FpdCByZXMuYXJyYXlCdWZmZXIoKTtcbiAgICBjb25zdCB0eXBlZEFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYm9keSk7XG4gICAgbGV0IGFycmF5ID0gWy4uLnR5cGVkQXJyYXldO1xuICAgIGFycmF5Lmxlbmd0aD01MDtcbiAgICAvL2NvbnNvbGUubG9nKFN0cmluZy5mcm9tQ2hhckNvZGUoLi4uYXJyYXkpKTtcbiAgICBodG1sRmxhZz10cnVlO1xuICB9IFxuIGVsc2V7XG4gICBsZXQgY3Q9cmVzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKS50b0xvd2VyQ2FzZSgpO1xuICAgLy9jb25zb2xlLmxvZyhjdCk7XG4gICBpZihjdC5pbmNsdWRlcygndGV4dCcpKXtcbiAgICAgIGxldCBoZWFkVGV4dD1pbmplY3RzO1xuICAgICAgYm9keT0oYXdhaXQgcmVzLnRleHQoKSlcbiAgICAgICAgLnJlcGxhY2VBbGwoXCJkZWxldGUgZ2xvYmFsVGhpcy5QcmlzbVwiLFwiXCIpXG4gICAgICAgIC5yZXBsYWNlKCc8aGVhZD4nLCc8aGVhZD4nK2hlYWRUZXh0KVxuICAgICAgICAucmVwbGFjZSgnPC9oZWFkPicsaGVhZFRleHQrJzwvaGVhZD4nKTtcbiAgICAgIGlmKGJvZHkuaW5jbHVkZXMoJzxodG1sJyl8fGN0LmluY2x1ZGVzKCdwbGFpbicpKXtodG1sRmxhZz10cnVlO31cbiAgICB9XG4gZWxzZSBpZihmbGF0VVJMLmVuZHNXaXRoKCcuanMnKSl7XG4gICAgYm9keT0oYXdhaXQgcmVzLnRleHQoKSkucmVwbGFjZUFsbChob3N0VGFyZ2V0LGxvY2FsaG9zdCk7XG4gIH1cbiAgZWxzZSBpZiAocmVzLmJvZHkpIHtcbiAgICBib2R5ID0gYXdhaXQgcmVzLmFycmF5QnVmZmVyKCk7XG4gICAgY29uc3QgdHlwZWRBcnJheSA9IG5ldyBVaW50OEFycmF5KGJvZHkpO1xuICAgIGxldCBhcnJheSA9IFsuLi50eXBlZEFycmF5XTtcbiAgICBhcnJheS5sZW5ndGg9NTA7XG4gICAgLy9jb25zb2xlLmxvZyhTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmFycmF5KSk7XG4gIH1cbn1cbiAgbGV0IHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKGJvZHkpO1xuICBmb3IgKGxldCBoZWFkZXIgaW4gcmVzcG9uc2UuaGVhZGVycy5rZXlzKSB7XG4gICAgaWYgKGhlYWRlcikge1xuICAgICAgaWYgKHNraXBSZXNwb25zZUhlYWRlcnMuaW5jbHVkZXMoaGVhZGVyLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgcmVxdWVzdC5oZWFkZXJzLnNldChcbiAgICAgICAgaGVhZGVyLFxuICAgICAgICByZXNwb25zZS5oZWFkZXJzLmdldChoZWFkZXIpLnRvU3RyaW5nKCkucmVwbGFjZShob3N0VGFyZ2V0LCBsb2NhbGhvc3QpLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBpZihodG1sRmxhZyl7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsJ3RleHQvaHRtbCcpO1xuICB9XG4gIGlmKCFyZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykpe1xuICAgIHJlc3BvbnNlLmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCd0ZXh0L2h0bWwnKTtcbiAgfVxuICBpZihyZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygncGxhaW4nKSl7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsJ3RleHQvaHRtbCcpO1xuICB9XG4gIGlmKGZsYXRVUkwuZW5kc1dpdGgoJy5qcycpKXtcbiAgICByZXNwb25zZS5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywndGV4dC9qYXZhc2NyaXB0Jyk7XG4gIH1cbiAgaWYoZmxhdFVSTC5lbmRzV2l0aCgnLmNzcycpKXtcbiAgICByZXNwb25zZS5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywndGV4dC9jc3MnKTtcbiAgfVxuICBpZihmbGF0VVJMLmVuZHNXaXRoKCcuc3ZnJykpe1xuICAgIHJlc3BvbnNlLmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCdpbWFnZS9zdmcreG1sJyk7XG4gIH1cbiAgaWYoZmxhdFVSTC5lbmRzV2l0aCgnLnBuZycpKXtcbiAgICByZXNwb25zZS5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywnaW1hZ2UvcG5nJyk7XG4gIH1cbiAgaWYoZmxhdFVSTC5lbmRzV2l0aCgnLmpwZycpfHxmbGF0VVJMLmVuZHNXaXRoKCcuanBlZycpKXtcbiAgICByZXNwb25zZS5oZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywnaW1hZ2UvanBlZycpO1xuICB9XG4gIC8vY29uc29sZS5sb2cocmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKTtcbiAgLy9yZXNwb25zZSA9IGFkZENhY2hlSGVhZGVycyhyZXNwb25zZSk7XG4gIHJldHVybiByZXNwb25zZTtcbiAgfWNhdGNoKGUpe1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoJ0Vycm9yOiAnK2Use3N0YXR1czo1MDB9KTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGFkZENhY2hlSGVhZGVycyhyZSl7XG4gIHJlLmhlYWRlcnMuc2V0KFwiQ0ROLUNhY2hlLUNvbnRyb2xcIixcbiAgICBcInB1YmxpYywgbWF4LWFnZT05NjQwMCwgcy1tYXgtYWdlPTk2NDAwLCBzdGFsZS1pZi1lcnJvcj0zMTUzNTAwMCwgc3RhbGUtd2hpbGUtcmV2YWxpZGF0ZT0zMTUzNTAwMFwiXG4gKTtcbiAgcmUuaGVhZGVycy5zZXQoXCJDYWNoZS1Db250cm9sXCIsXG4gICBcInB1YmxpYywgbWF4LWFnZT05NjQwMCwgcy1tYXgtYWdlPTk2NDAwLCBzdGFsZS1pZi1lcnJvcj0zMTUzNTAwMCwgc3RhbGUtd2hpbGUtcmV2YWxpZGF0ZT0zMTUzNTAwMFwiXG4pO1xuICByZS5oZWFkZXJzLnNldCggXCJDbG91ZGZsYXJlLUNETi1DYWNoZS1Db250cm9sXCIsXG4gICAgXCJwdWJsaWMsIG1heC1hZ2U9OTY0MDAsIHMtbWF4LWFnZT05NjQwMCwgc3RhbGUtaWYtZXJyb3I9MzE1MzUwMDAsIHN0YWxlLXdoaWxlLXJldmFsaWRhdGU9MzE1MzUwMDBcIlxuKTtcbiAgcmUuaGVhZGVycy5zZXQoXCJTdXJyb2dhdGUtQ29udHJvbFwiLFxuICAgXCJwdWJsaWMsIG1heC1hZ2U9OTY0MDAsIHMtbWF4LWFnZT05NjQwMCwgc3RhbGUtaWYtZXJyb3I9MzE1MzUwMDAsIHN0YWxlLXdoaWxlLXJldmFsaWRhdGU9MzE1MzUwMDBcIlxuKTtcbiAgcmUuaGVhZGVycy5zZXQoXCJWZXJjZWwtQ0ROLUNhY2hlLUNvbnRyb2xcIixcbiAgIFwicHVibGljLCBtYXgtYWdlPTk2NDAwLCBzLW1heC1hZ2U9OTY0MDAsIHN0YWxlLWlmLWVycm9yPTMxNTM1MDAwLCBzdGFsZS13aGlsZS1yZXZhbGlkYXRlPTMxNTM1MDAwXCJcbik7XG4gIHJldHVybiByZTtcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxxQkFBcUI7QUFDNUIsT0FBTyxxQkFBcUI7QUFDNUIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8saUJBQWlCO0FBQ3hCLElBQUksYUFBYTtBQUNqQixJQUFJLGFBQWE7QUFFakIsTUFBTSxxQkFBK0I7SUFBQztDQUFrQjtBQUN4RCxNQUFNLHNCQUFzQjtJQUNFO0lBQ0Q7SUFDQTtJQUNBO0NBQ0E7QUFFN0IsSUFBSSxVQUFVLFVBQVUsQ0FBQyx1QkFBdUIsR0FDOUMsVUFBVSxDQUFDLGdCQUFn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