// dependencies
const fbAds = require('facebook-nodejs-ads-sdk');
const moment = require('moment');
const fetch = require('node-fetch');
var http = require("https");

//Access
const api = fbAds.FacebookAdsApi.init(process.env.MARKETING_KEY);
const account =  new fbAds.AdAccount(`act_${process.env.ADUSER_ID}`);
const pageId = process.env.PAGE_ID;

//sdk Classes
const Campaign = fbAds.Campaign;
const Targeting = fbAds.Targeting;
const TargetingGeoLocation = fbAds.TargetingGeoLocation;
const TargetingGeoLocationCustomLocation = fbAds.TargetingGeoLocationCustomLocation;
const AdSet = fbAds.AdSet;
const AdCreative = fbAds.AdCreative;
const AdCreativeObjectStorySpec = fbAds.AdCreativeObjectStorySpec;
const AdCreativeLinkData = fbAds.AdCreativeLinkData;
const AdCreativeLinkDataCallToAction = fbAds.AdCreativeLinkDataCallToAction;
const AdCreativeLinkDataCallToActionValue =   fbAds.AdCreativeLinkDataCallToActionValue;
const Ad = fbAds.Ad;

//fb adinterests
const adinterests = require('../config/facebook/adinterest');


const createTarget = ({radius, latLng}) => ({
    [Targeting.Fields.geo_locations]: {
      [TargetingGeoLocation.Fields.custom_locations]: [{
        [TargetingGeoLocationCustomLocation.Fields.distance_unit]: 'kilometer',
        [TargetingGeoLocationCustomLocation.Fields.radius]: radius,
        [TargetingGeoLocationCustomLocation.Fields.latitude]: latLng.lat,
        [TargetingGeoLocationCustomLocation.Fields.longitude]: latLng.lng
      }],
      [TargetingGeoLocation.Fields.location_types]: ['recent', 'home']
    },
    [Targeting.Fields.age_min]: '13',
    [Targeting.Fields.age_max]: '60',
    [Targeting.Fields.publisher_platforms]: ['facebook'],
    [Targeting.Fields.facebook_positions]:  ['feed', 'right_hand_column']
  });

const errorHandler = (error, at) => {
  console.log('error in facebook marketing api', error);
  return Promise.reject({
    statusCode: error.status || 500,
    code: error.message ||'at facebook marketing api' ,
    at: at,
    data: error.response && error.response.error ? 
      { url:  error.url , data: error.data , method: error.method, error_user_msg: error.response.error.error_user_msg } : error, 
  })
} 

module.exports = {
  createCampaign:  ({campaignName, status}) => (
    account.createCampaign(
        [Campaign.Fields.id],
        {
          [Campaign.Fields.name]: campaignName,
          [Campaign.Fields.status]: Campaign.Status.paused,
          [Campaign.Fields.objective]: Campaign.Objective.conversions
        }
      )
      .then((result) => (
        Promise.resolve(result)
      ))
      .catch((error) => (
        errorHandler(error, 'createCampaign')
      ))
  ),

  createAdSet: ({name, dailyBudget, endTime, radius, latLng}) => (
    api.call('POST', [`act_${process.env.ADUSER_ID}`, 'adsets'],
      {
        [AdSet.Fields.name]: name,
        [AdSet.Fields.optimization_goal]: AdSet.OptimizationGoal.reach,
        [AdSet.Fields.daily_budget]: dailyBudget * 0.9,
        [AdSet.Fields.is_autobid]: true,
        [AdSet.Fields.campaign_id]: process.env.CAMPAIGN_ID,
        [AdSet.Fields.targeting]: createTarget({radius, latLng}),
        [AdSet.Fields.start_time]: moment().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss Z'),
        [AdSet.Fields.end_time]: moment().add(25, 'hours').format('YYYY-MM-DD HH:mm:ss Z'),
        [AdSet.Fields.billing_event]: AdSet.BillingEvent.impressions
      }
    )
    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => (
      errorHandler(error , 'createAdSet')
    ))
  ),

  getAllCampaign: () => (
    account.getCampaigns()
    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => (
      errorHandler(error, 'createAdSet')
    ))
  ),

  createAdCreative: ({name, body, image_hash, title, description, dogId, adSetId})=> (
    api.call('POST', [`act_${process.env.ADUSER_ID}`, 'adcreatives'], {
     [AdCreative.Fields.name]: `D:${dogId}-${adSetId}`,
     [AdCreative.Fields.object_type]: AdCreative.ObjectType.photo,
      [AdCreative.Fields.object_story_spec]: {
        [AdCreativeObjectStorySpec.Fields.link_data]: {
          [AdCreativeLinkData.Fields.link]: process.env.APP_NAME + process.env.DOG_URL + dogId + '',
          [AdCreativeLinkData.Fields.name]: title,
          [AdCreativeLinkData.Fields.message]: body,
          [AdCreativeLinkData.Fields.caption]: 'www.lostdog.mx',
          [AdCreativeLinkData.Fields.description]: description,
          [AdCreativeLinkData.Fields.image_hash]: image_hash,
          [AdCreativeLinkData.Fields.call_to_action]: {
            [AdCreativeLinkDataCallToAction.Fields.type]: AdCreativeLinkDataCallToAction.Type.learn_more,
            [AdCreativeLinkDataCallToAction.Fields.value]: { [AdCreativeLinkDataCallToActionValue.Fields.link]: process.env.APP_NAME + process.env.DOG_URL + dogId + '' }
          }
        },
          [AdCreativeObjectStorySpec.Fields.page_id]: pageId
      }
    })
    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => (
      errorHandler(error , 'createAdCreative')
    ))
  ),

  bindSetCreative: ({adName, adSetId, adCreativeId}) => {
    return api.call('POST', [`act_${process.env.ADUSER_ID}`, 'ads'], {
      [Ad.Fields.name]: adName,
      [Ad.Fields.adset_id]: adSetId,
      [Ad.Fields.creative]: {creative_id: adCreativeId},
      [Ad.Fields.status]: Ad.Status.paused
    })
    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => (
      errorHandler(error , 'bindSetCreative')
    ))
  },

  getReachEstimate: ({adSetId, radius, latLng}) => {
    const params = {
      optimization_goal: 'REACH',
      targeting_spec: JSON.stringify(createTarget({radius, latLng}))
    }
    console.log('adSetId', adSetId);
    return api.call('GET', [adSetId, 'delivery_estimate'], params)
    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => (
      errorHandler(error, 'getReachEstimate')
    ))
  },

  setImage: (img) => (
    api.call('POST', [`act_${process.env.ADUSER_ID}`, 'adimages'], {bytes: img.replace(/^(.+?),/, ''), encoding: img.match(/^(.+?),/, '') && img.match(/^(.+?),/, '')[0]})

    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => (
      errorHandler(error , 'setImage')
    ))    
  ),

  updateAdSet: ({adSetId, dailyBudget, endTime}) => {
    return api.call('POST', [adSetId], {
      [AdSet.Fields.daily_budget]: Math.round(dailyBudget * 0.9),
      [AdSet.Fields.end_time]: moment().add(endTime * 24 + 1, 'hours').format('YYYY-MM-DD HH:mm:ss Z'),
    })
    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => (
      errorHandler(error, 'updateAdSet')
    ))
  },

  deleteAdSet: (adSetId) => (
    api.call('DELETE', [adSetId], {})
    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => (
      errorHandler(error, 'deleteAdSet')
    ))
  )  
};
