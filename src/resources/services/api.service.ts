class ApiService {
    async apiGetRequest(url: any, headers?: any): Promise<any>{
        const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

        return new Promise(async (resolve, reject) => {
            let xhr = new XMLHttpRequest();
            
            xhr.open("GET", url)
            xhr.setRequestHeader("Content-Type", "application/json")

            xhr.onload = (evt: any) => {
                resolve(JSON.parse(xhr.responseText))
            }

            xhr.onerror = (evt: any) => {
                reject({
                    url,
                    method: 'GET',
                    message: xhr.statusText
                });
            }
            

            xhr.send()
        });
    }
}

export default ApiService