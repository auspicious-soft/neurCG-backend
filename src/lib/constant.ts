export const httpStatusCode = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
}


export const priceIdsMap = {
    'free': process.env.STRIPE_PRICE_FREE as string,
    'intro': process.env.STRIPE_PRICE_INTRO as string,
    'pro': process.env.STRIPE_PRICE_PRO as string
}

export const yearlyPriceIdsMap = {
    'intro': process.env.STRIPE_YEARLY_PRICE_INTRO as string,
    'pro': process.env.STRIPE_YEARLY_PRICE_PRO as string
}


export const creditCounts = {
    'free': 24,
    'intro': 90,
    'pro': 180
}

export const yearlyCreditCounts = {
    'intro': 1080,
    'pro': 2160
}