import {
  validateNonce,
  getQuotaData,
  validateSignature,
  updateRow
} from "../upload/upload.service";
import { checkCID } from "../getStatus/getStatus.service";

const getLink = async (req, res) => {
  const { quoteId, nonce, signature } = req.query;
  try {
    const data = await getQuotaData(quoteId);

    if (
      !(await validateSignature(quoteId, nonce, data.userAddress, signature))
    ) {
      return res.status(400).json({ message: "Invalid signature", data: {} });
    }

    if (!(await validateNonce(data.userAddress, nonce))) {
      return res.status(400).json({ message: "Invalid nonce", data: {} });
    }

    const response = await checkCID(data.requestID);
    const _temp = response?.data?.map((e) => ({
      CID: e.cid,
      type: "fileCoin",
    }));
    await updateRow(nonce,quoteId,{})
    return res.status(200).json(_temp);
  } catch (e) {
    return res.status(400).json({ message: e.message, data: {} });
  }
};

const rejectRequest = (req, res) => {
  return res.status(406).json({ message: "Method Not allowed", data: {} });
};

export default {
  rejectRequest,
  getOne: getLink,
  updateOne: rejectRequest,
};
