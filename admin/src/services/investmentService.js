const config = require("config")
const { default: axios } = require("axios");

class InvestmentService {
  constructor(url, options = {}) {
    this.service = axios.create({
      baseURL: url,
      ...options
    })
  }

  get = async () => {
    try {
      const { data } = await this.service.get('investments')

      return data;
    } catch (e) {
      return []
    }
  }

  getById = async (id) => {
    const { data } = await this.service.get(`investments/${id}`)

    return data
  }

  sendReport = (report) => {
    return this.service.post('investments/export', { report })
  }
}

module.exports = new InvestmentService(config.investmentsServiceUrl)