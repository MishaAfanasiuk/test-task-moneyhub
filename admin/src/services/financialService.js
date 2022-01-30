const config = require("config")
const { default: axios } = require("axios");

class FinancialService {
  constructor(url, options = {}) {
    this.service = axios.create({
      baseURL: url,
      ...options
    })
  }

  getCompany = async (id) => {
    try {
      const { data } = await this.service.get(`/companies/${id}`);

      return data
    } catch {
      return null;
    }
  }
}

module.exports = new FinancialService(config.financialServiceUrl)