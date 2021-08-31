/* eslint-disable max-len */
import parseExpressions from "spdx-expression-parse";
import { osi, fsf, deprecated } from "./licenses.js";

function checkEveryTruthy(...arrayOfBooleans) {
  return arrayOfBooleans.every((check) => check);
}

function checkSomeTruthy(...arrayOfBooleans) {
  return arrayOfBooleans.some((check) => check);
}

function checkSpdx(licenseToCheck) {
  return {
    osi: osi.includes(licenseToCheck),
    fsf: fsf.includes(licenseToCheck),
    fsfAndOsi: OSI.includes(licenseToCheck) && FSF.includes(licenseToCheck),
    includesDeprecated: deprecated.includes(licenseToCheck)
  };
}

export default (licenseID, options = { throwOnError: false }) => {
  if (typeof licenseID !== "string") {
    throw new TypeError("expecter licenseID to be a strnig");
  }

  try {
    const data = parseExpressions(licenseID);

    return handleLicenseCase(data, licenseID, options);
  }
  catch (err) {
    const data = {
      error: true,
      errorMessage: `Passed license expression was not a valid license expression. Error from spdx-expression-parse: ${error}`
    };

    return handleLicenseCase(data, licenseID, options);
  }
};

function handleLicenseCase(data, licenseID, options) {
  if (data.error && options.throwOnError) {
    throw new Error(data.errorMessage);
  }

  const licenses = {
    uniqueLicenseIds: [],
    spdxLicenseLinks: [],
    spdx: {
      osi: false,
      fsf: false,
      fsfAndOsi: false,
      includesDeprecated: false
    }
  };

  if (typeof data.license === "string") {
    const spdxCheck = checkSpdx(data.license);
    licenses.spdx = spdxCheck;

    licenses.uniqueLicenseIds.push(data.license);
    licenses.spdxLicenseLinks.push(`https://spdx.org/licenses/${data.license}.html#licenseText`);
  }
  else if (typeof data.right.license === "string") {
    const spdxCheckLeft = checkSpdx(data.left.license);
    const spdxCheckRight = checkSpdx(data.right.license);

    licenses.spdx.osi = checkEveryTruthy(spdxCheckLeft.osi, spdxCheckRight.osi);
    licenses.spdx.fsf = checkEveryTruthy(spdxCheckLeft.fsf, spdxCheckRight.fsf);
    licenses.spdx.fsfAndOsi = checkEveryTruthy(spdxCheckLeft.fsfAndOsi, spdxCheckRight.fsfAndOsi);
    licenses.spdx.includesDeprecated = checkSomeTruthy(spdxCheckLeft.includesDeprecated, spdxCheckRight.includesDeprecated);

    licenses.uniqueLicenseIds.push(
      data.left.license,
      data.right.license
    );

    licenses.spdxLicenseLinks.push(
      `https://spdx.org/licenses/${data.left.license}.html#licenseText`,
      `https://spdx.org/licenses/${data.right.license}.html#licenseText`
    );
  }
  else if (typeof data.right.left.license === "string") {
    const spdxCheckLeft = checkSpdx(data.left.license);
    const spdxCheckRightLeft = checkSpdx(data.right.left.license);
    const spdxCheckRightRight = checkSpdx(data.right.right.license);

    licenses.spdx.osi = checkEveryTruthy(spdxCheckLeft.osi, spdxCheckRightLeft.osi, spdxCheckRightRight.osi);
    licenses.spdx.fsf = checkEveryTruthy(spdxCheckLeft.fsf, spdxCheckRightLeft.fsf, spdxCheckRightRight.fsf);
    licenses.spdx.fsfAndOsi = checkEveryTruthy(spdxCheckLeft.fsfAndOsi, spdxCheckRightLeft.fsfAndOsi, spdxCheckRightRight.fsfAndOsi);
    licenses.spdx.includesDeprecated = checkSomeTruthy(spdxCheckLeft.includesDeprecated, spdxCheckRightLeft.includesDeprecated, spdxCheckRightRight.includesDeprecated);

    licenses.uniqueLicenseIds.push(
      data.left.license,
      data.right.left.license,
      data.right.right.license
    );

    licenses.spdxLicenseLinks.push(
      `https://spdx.org/licenses/${data.left.license}.html#licenseText`,
      `https://spdx.org/licenses/${data.right.left.license}.html#licenseText`,
      `https://spdx.org/licenses/${data.right.right.license}.html#licenseText`
    );
  }

  return licenses;
}
