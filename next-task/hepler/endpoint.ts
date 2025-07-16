
const frontUrl = "http://localhost:5000/api"
const adminUrl = frontUrl + "/admin"


export const endpoint = {
    adminLogin:  adminUrl + "/login",
    jobs: adminUrl + "/jobs",
    generateMcqs: frontUrl + "/generate-mcqs",
    saveResult: frontUrl + "/save-results",
}