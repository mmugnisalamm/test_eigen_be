async function filter(req, query) {
    return new Promise(async (resolve, reject) => {
        try {
            if (Object.keys(req).length > 0) {
                let checkString = query.toLowerCase();
                if (!checkString.includes("where")) {
                    query = query + " WHERE ";
                }
                for (let index = 0; index < Object.keys(req).length; index++) {
                    const field = Object.keys(req)[index];
                    const value = Object.values(req)[index];
                    if (field == 'title') {
                        query = query + "lower(title) like lower('%"+value+"%') ";
                    }
                    if (field == 'minYear') {
                        query = query + "release_year >= "+value+" ";
                    }
                    if (field == 'maxYear') {
                        query = query + "release_year <= "+value+" ";
                    }
                    if (field == 'minPage') {
                        query = query + "total_page >= "+value+" ";
                    }
                    if (field == 'maxPage') {
                        query = query + "total_page <= "+value+" ";
                    }
                    if (field == 'sortByTitle') {
                        query = query + "ORDER BY title upper("+value+") ";
                    }
                    if (index < Object.keys(req).length-1) {
                        query = query + "AND ";
                    }
                }
            }
            resolve(query);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = filter;