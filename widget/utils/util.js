import UserCenter from './user.js'
const $util = {
    openWin(_param){
        var param = _param;
        param.hideNavigationBar = false;
        param.navigationBar = {
            shadow: '#f1f1f1',
            backButton: {
                iconPath: 'widget://images/back/back.png'
            }
        };
        if (this.isApp()) {
            api.openTabLayout(param);
        } else {
            api.openWin(param);
        }
    },
    goLogin(){
        this.openWin({
            name: 'login',
            url: '../oauth/oauth.stml',
            title: '登录'
        });
    },
    isApp(){
        if (api.platform && api.platform == 'app') {
            return true;
        }
        return false;
    },
    isMp(){
        if (api.platform && api.platform == 'mp') {
            return true;
        }
        return false;
    },
    toast(msg){
        api.toast({
            msg: msg,
            location: 'middle'
        });
    },
    showProgress(){
        api.showProgress({
            text: '',
            modal: false
        });
    },
    hideProgress(){
        api.hideProgress();
    },
    fitRichText(richtext, width){
        var str = `<img style="max-width:${width}px;"`;
        var result = richtext.replace(/\<img/gi, str);
        return result;
    },
    ajax(p, callback) {
        var param = p;
        if (!param.headers) {
            param.headers = {};
        }
        param.headers['X-AppToken'] = UserCenter.getAccessToken();
        if (param.data && param.data.body) {
            param.headers['Content-Type'] = 'application/json; charset=utf-8';
        }
        if (param.url) {
            var baseUrl = 'https://a6047344573226-dev.apicloud-saas.com/api/';
            param.url = baseUrl + param.url;
        }
        api.ajax(param, (res, err)=> {
            let ret = res;
            if (err && err.body && err.body.errCode) {
                ret = err.body;
                callback(ret);
            } else {
                callback(ret, err);
            }
            let sessionExpiration = false;
            if (ret && ret.errCode && ret.errCode>100) {
                sessionExpiration = true;
            }
            if (sessionExpiration) {
                var didShowLogoutAlert = api.getGlobalData({
                    key: 'didShowLogoutAlert'
                });
                if (!didShowLogoutAlert) {
                    api.setGlobalData({
                        key: 'didShowLogoutAlert',
                        value: true
                    });

                    UserCenter.setUserInfo('');
                    api.confirm({
                        msg: '登录已失效，请重新登录',
                        buttons: ['取消', '重新登录']
                    }, (ret)=> {
                        api.setGlobalData({
                            key: 'didShowLogoutAlert',
                            value: false
                        });
                        if (ret.buttonIndex == 2) {
                            this.goLogin();
                        }
                    });
                }
            }
        });
    },
    payOrder(orderid, callback){
        this.ajax({
            url: 'homes/payOrder?orderid=' + orderid
        }, (res, err)=>{
            // console.log(JSON.stringify(res||err));
            if (res) {
                if (res.errcode != 0) {
                    callback && callback(false, res.msg ? res.msg : '参数错误');
                } else {
                    if ($util.isApp()) {
                        var wxPayPlus = api.require('wxPayPlus');
                        wxPayPlus.payOrder({
                            orderId: '',
                            mchId: '',
                            nonceStr: '',
                            timeStamp: '',
                            package: '',
                            sign: ''
                        }, (ret, error)=> {
                            if (ret.status) {
                                //支付成功
                                callback && callback(true, '支付成功');
                            } else {
                                callback && callback(false, '支付失败');
                            }
                        });
                    } else {
                        wx.requestPayment({
                            timeStamp: payret.timeStamp,
                            nonceStr: payret.nonceStr,
                            package: payret.package,
                            paySign: payret.paySign,
                            signType: 'MD5',
                            success:(ret)=> {
                                //支付成功
                                callback && callback(true, '支付成功');
                            },
                            fail:(ret)=> {
                                callback && callback(false, '支付失败');
                            }
                        });
                    }
                }
            } else {
                callback && callback(false, '支付失败');
            }
        });
    }
}
export default $util;
