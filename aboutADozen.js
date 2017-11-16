const PERMITTED_ENUM = {
  FORCED: 'forced',
  ALLOWED: 'allowed',
  FORBIDDEN: 'forbidden',
};

const STRINGS = {
  en: {
    one: 'a',
    dozen: 'dozen',
    bakersDozen: 'baker\'s dozen',
    error:{
      NaN: 'Number is not a number',
    },
    fragmentArray: [
      ({countText, nextCountText, unitText}) => `${countText} ${unitText}`,
      ({countText, nextCountText, unitText}) => `about ${countText} ${unitText}`,
      ({countText, nextCountText, unitText}) => `just over ${countText} ${unitText}`,
      ({countText, nextCountText, unitText}) => `a little over ${countText} ${unitText}`,
      ({countText, nextCountText, unitText}) => `over ${countText} ${unitText}`,
      ({countText, nextCountText, unitText}) => `about ${countText} and a half ${unitText}`,
      ({countText, nextCountText, unitText}) => `${countText} ${unitText} and a half`,
      ({countText, nextCountText, unitText}) => `about ${countText} and a half ${unitText}`,
      ({countText, nextCountText, unitText}) => `over ${countText} and a half ${unitText}`,
      ({countText, nextCountText, unitText}) => `less than ${nextCountText} ${unitText}`,
      ({countText, nextCountText, unitText}) => `nearly ${nextCountText} ${unitText}`,
      ({countText, nextCountText, unitText}) => `almost ${nextCountText} ${unitText}`,
    ],
    bakersFragmentAdjustment: [
      ({countText, nextCountText, unitText}) => `for 6`,
      ({countText, nextCountText, unitText}) => `for 7`,
      ({countText, nextCountText, unitText}) => `for 8`,
      ({countText, nextCountText, unitText}) => `for 9`,
    ]
  }
};

const aboutADozen = (number, options={}) => {
  let bakersDozenPermitted, bakersFudgeFactor;

  // set lang
  let strings = STRINGS.en;
  if (options.lang && STRINGS.hasOwnProperty(options.lang)) {
    strings = STRINGS[options.lang];
  }

  // translate boolean settings into an ENUM
  bakersDozenPermitted = PERMITTED_ENUM.ALLOWED;
  if (options.useBakers === false) {
    bakersDozenPermitted = PERMITTED_ENUM.FORBIDDEN;
  } else if ( options.forceBakers === true) {
    bakersDozenPermitted = PERMITTED_ENUM.FORCED;
  }

  // settings for bakers fudge factor
  bakersFudgeFactor = 2; //TODO: persist this thru
  if (options.bakersFudge) {
    if (!isNaN(options.bakersFudge)){
      bakersFudgeFactor = Number(options.bakersFudge);
    }
  }

  // sanity check
  number = Number(number);
  if (isNaN(number)) {
    return strings.error.NaN;
  }

  return formatNumAsDozensString(number, strings, {bakersDozenPermitted, bakersFudgeFactor});
};

const formatNumAsDozensString = (number, langStrings, settings) => {
  const calculations = getCalculations(number);
  const doDisplayInBakersUnits = useBakers(settings.bakersDozenPermitted, calculations);
  const typeCalculations = (!doDisplayInBakersUnits) ? calculations.dozen : calculations.bakersDozen;
  const sentenceFragments = getSentenceFragments(langStrings, doDisplayInBakersUnits);

  return sentenceFragments[typeCalculations.remainder]({
    countText: (typeCalculations.floor === 1) ? langStrings.one : typeCalculations.floor.toString(),
    nextCountText: (typeCalculations.floor === 0) ? langStrings.one : (typeCalculations.floor + 1).toString(),
    unitText: (!doDisplayInBakersUnits) ? langStrings.dozen : langStrings.bakersDozen,
  });
};

const getCalculations = number => ({
  halfDozen:{
    remainder: number % 6,
  },
  dozen:{
    floor: Math.floor(number / 12),
    remainder: number % 12
  },
  bakersDozen:{
    floor: Math.floor(number / 13),
    remainder: number % 13,
  },
});

const getSentenceFragments = (langStrings, doDisplayInBakersUnits) => (
  (!doDisplayInBakersUnits) ?
    langStrings.fragmentArray.slice() :
    [
      ...langStrings.fragmentArray.slice(0,6),
      ...langStrings.bakersFragmentAdjustment,
      ...langStrings.fragmentArray.slice(9),
    ]
);

const useBakers = (bakersDozenPermitted, calculations) => {
  switch (bakersDozenPermitted) {
    case PERMITTED_ENUM.FORCED:
      return true;
      break;
    case PERMITTED_ENUM.FORBIDDEN:
      return false;
      break;
    case PERMITTED_ENUM.ALLOWED:
      return isBetterExpressedAsBakersDozen({
        remainderOf06: calculations.halfDozen.remainder,
        remainderOf12: calculations.dozen.remainder,
        remainderOf13: calculations.bakersDozen.remainder,
      });
      break;
    default:
      return false;
  }
};

const isBetterExpressedAsBakersDozen = ({remainderOf06, remainderOf12, remainderOf13}) => {
  const bakersFudgeFactor = 2;

  if ( remainderOf12 === 0 ){
    return false;
  } else if ( remainderOf13 === 0 ) {
    return true;
  } else if ( remainderOf06 === 0 ) {
    return false;
  } else if ( remainderOf13 < remainderOf12 && (
      remainderOf13 <= bakersFudgeFactor ||
      remainderOf13 >= (13 - bakersFudgeFactor)
    ) ){
    return true;
  }
  return false;
};

export default aboutADozen;
