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
    [Targeting.Fields.age_min]: 13,
    [Targeting.Fields.age_min]: 60,
    [Targeting.Fields.interests]: adinterests,
    [Targeting.Fields.publisher_platforms]: ['facebook'],
    [Targeting.Fields.facebook_positions]:  ['feed', 'right_hand_column']
  });

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
        Promise.reject({error})
      ))
  ),

  createAdSet: ({adSetName, DailyBudget, endTime, radius, latLng}) => (
    account.createAdSet(
      [AdSet.Fields.id],
      {
        [AdSet.Fields.name]: adSetName,
        [AdSet.Fields.optimization_goal]: AdSet.OptimizationGoal.link_clicks,
        [AdSet.Fields.daily_budget]: DailyBudget,
        [AdSet.Fields.is_autobid]: true,
        [AdSet.Fields.campaign_id]: process.env.CAMPAIGN_ID,
        [AdSet.Fields.targeting]: createTarget({radius, latLng}),
         [AdSet.Fields.start_time]: moment().add(30, 'mins').format('YYYY-MM-DD HH:mm:ss Z'),
         [AdSet.Fields.end_time]: moment().add(1, 'day').format('YYYY-MM-DD HH:mm:ss Z'),
         [AdSet.Fields.billing_event]: AdSet.BillingEvent.impressions
      }
    )
    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => (
      Promise.reject({error})
    ))
  ),

  getAllCampaign: () => (
    account.getCampaigns()
    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => (
      Promise.reject({error})
    ))
  ),

  createAdCreative: ({AdCreativeName, body, image_url, link, title, description})=> (
    account.createAdCreative(
      [AdCreative.Fields.id],
      {
       [AdCreative.Fields.name]: AdCreativeName,
       [AdCreative.Fields.object_type]: AdCreative.ObjectType.photo,
        [AdCreative.Fields.object_story_spec]: {
          [AdCreativeObjectStorySpec.Fields.link_data]: {
            [AdCreativeLinkData.Fields.link]: link,
            [AdCreativeLinkData.Fields.name]: title,
            [AdCreativeLinkData.Fields.message]: body,
            [AdCreativeLinkData.Fields.caption]: 'www.lostdog.mx',
            [AdCreativeLinkData.Fields.description]: description,
            [AdCreativeLinkData.Fields.picture]: image_url,
            [AdCreativeLinkData.Fields.call_to_action]: {
              [AdCreativeLinkDataCallToAction.Fields.type]: AdCreativeLinkDataCallToAction.Type.learn_more,
              [AdCreativeLinkDataCallToAction.Fields.value]: { [AdCreativeLinkDataCallToActionValue.Fields.link]: link }
            }
          },
            [AdCreativeObjectStorySpec.Fields.page_id]: pageId
          }
      }
    )
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
      Promise.reject({error})
    ))
  },

  getReachEstimate: ({daily_budget, currency, radius, latLng}) => {
    const params = {
      currency,
      daily_budget,
      optimize_for: 'OFFSITE_CONVERSIONS',
      targeting_spec: JSON.stringify(createTarget({radius, latLng}))
    }
    return api.call('GET', [`act_${process.env.ADUSER_ID}`, 'reachestimate'], params)
    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => {
      console.log('error', error);
      return Promise.reject(error)
    })
  },

  setImage: ({bytes}) => {
    return api.call('POST', [`act_${process.env.ADUSER_ID}`, 'adimages'], {bytes: bytes.replace(/^(.+?),/, ''), encoding: bytes.match(/^(.+?),/, '') && bytes.match(/^(.+?),/, '')[0]})
    .then((result) => (
      Promise.resolve(result)
    ))
    .catch((error) => {
      console.log('error', error);
      return Promise.reject(error)
    })    
  }
};
