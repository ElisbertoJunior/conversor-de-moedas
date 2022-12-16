const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')

const APIKey = `f692a6160aadc493e4e7c442`

const showAlert = error => {
  const div = document.createElement('div')
  const button = document.createElement('button')

    div.textContent = error.message
    div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show')
    div.setAttribute('role', 'alert')
    button.classList.add('btn-close')
    button.setAttribute('type', 'button')
    button.setAttribute('aria-label', 'Close')

    button.addEventListener('click', () => {
      div.remove()
    })

    div.appendChild(button)
    currenciesEl.insertAdjacentElement('afterend', div)
}

const state = (() => {
  let exchangeRate = {}

  return {
    getExchangeRate: () => exchangeRate,
    setExchangeRate: newExchangeRate => {
      if (!newExchangeRate.conversion_rates) {
        showAlert({ message: 'O obj precisa ter umas propriedade conversion_rates'})
        return
      }

      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()



const getErrorMessage = errorType => ({
  'unsuported-code': `A moeda nao existe no nosso banco de dados,`,
  'base-code-only-on-pro': `Informacoes de moedas que nao sejam USD ou EUR so podem ser acessadas a pa`,
  'malformed-request': `O endpoint do seu requeste precisa seguir a estrutura a seguir`,
  'inavlid-key': `A chave da API nao e valida.`,
  'quota-reached': `Sua conta alcancou o limite de requests permitido no seu plano atual. `,
  'not-available-on-plan': `Seu plano atual nao permite esse tipo de request`
})[errorType] || 'Nao foi possivel obter as infromacoes.'


const getCurrentUrl = currency => 
  `https://v6.exchangerate-api.com/v6/${APIKey}/latest/${currency}`

const fetchExchangeRate = async url => {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Nao foi possivel obter as infromacoes.')
    }

    const exchangeRateData = await response.json()

    if (exchangeRateData.result === 'error') {
      const errorMessage = getErrorMessage(exchangeRateData['error-type'])
      throw new Error(errorMessage)
    }

    return state.setExchangeRate(exchangeRateData)
  } catch (error) {
    showAlert(error)

  }

}

const getOptions = (selectedCurrency, keyValues) => {
  const setSelectedAttribute = currency => 
    currency === selectedCurrency ? 'selected' : ''
  const getOptionsAsArray = currency => 
    `<option ${setSelectedAttribute(currency)}>${currency}</option>`

    return keyValues.map(getOptionsAsArray).join('')
}

const showInitialInfo = keyValues => {
    currencyOneEl.innerHTML = getOptions('USD', keyValues)
    currencyTwoEl.innerHTML = getOptions('BRL', keyValues)
}

const initConverter = async () => {
  const exchangeRateData = await fetchExchangeRate(getCurrentUrl('USD'))
  const { conversion_rates } = exchangeRateData
  const keyValues = Object.keys(conversion_rates)

  if (exchangeRateData && conversion_rates) {
    showInitialInfo(keyValues)
    updatedValues(conversion_rates)
  }
  
}

const updatedValues = conversion => {
  const currencyOne = currencyOneEl.value
  const currencyTwo = conversion[currencyTwoEl.value]
  const timesCurrency = timesCurrencyOneEl.value * currencyTwo
  const multipliedExchangeRate = `${timesCurrency.toFixed(2)} ${currencyTwoEl.value}`
  const precisionValue = `1 ${currencyOne} = ${currencyTwo.toFixed(2)} ${currencyTwoEl.value}`
  
  convertedValueEl.textContent = multipliedExchangeRate
  valuePrecisionEl.textContent = precisionValue
  
}

const showUpdatedRates = () => {
  const { conversion_rates } = state.getExchangeRate()
  updatedValues(conversion_rates)
}

const showInitialValues = async event => {
  const url = getCurrentUrl(event.target.value)
  const { conversion_rates } = await fetchExchangeRate(url)

  updatedValues(conversion_rates)
}


currencyOneEl.addEventListener('input', showInitialValues)
currencyTwoEl.addEventListener('input', showUpdatedRates)
timesCurrencyOneEl.addEventListener('input', showUpdatedRates)

initConverter()

  




