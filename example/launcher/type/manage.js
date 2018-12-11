module.exports = async(requestParams) => {
    return `${requestParams.username}_${requestParams.password}`;
}

