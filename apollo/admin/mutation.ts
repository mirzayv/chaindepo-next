import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberShipments
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        SHIPMENT        *
 *************************/

export const UPDATE_SHIPMENT_BY_ADMIN = gql`
	mutation UpdateShipmentByAdmin($input: ShipmentUpdate!) {
		updateShipmentByAdmin(input: $input) {
			_id
			shipmentType
			shipmentStatus
			shipmentOrigin
			shipmentDestination
			shipmentAddress
			shipmentTitle
			shipmentPrice
			shipmentWeight
			shipmentTrackingCode
			shipmentViews
			shipmentLikes
			shipmentImages
			shipmentDesc
			memberId
			carrierId
			deliveredAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_SHIPMENT_BY_ADMIN = gql`
	mutation RemoveShipmentByAdmin($input: String!) {
		removeShipmentByAdmin(shipmentId: $input) {
			_id
			shipmentType
			shipmentStatus
			shipmentOrigin
			shipmentDestination
			shipmentAddress
			shipmentTitle
			shipmentPrice
			shipmentWeight
			shipmentTrackingCode
			shipmentViews
			shipmentLikes
			shipmentImages
			shipmentDesc
			memberId
			carrierId
			deliveredAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;
