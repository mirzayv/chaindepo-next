import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
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
			memberWarnings
			memberBlocks
			memberShipments
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
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
			memberWarnings
			memberBlocks
			memberShipments
			memberRank
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
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

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
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
			memberWarnings
			memberBlocks
			memberShipments
			memberRank
			memberPoints
			memberLikes
			memberViews
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

export const CREATE_SHIPMENT = gql`
	mutation CreateShipment($input: ShipmentInput!) {
		createShipment(input: $input) {
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
			lastEventHash
			deliveredAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_SHIPMENT = gql`
	mutation UpdateShipment($input: ShipmentUpdate!) {
		updateShipment(input: $input) {
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
			lastEventHash
			deliveredAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_SHIPMENT = gql`
	mutation LikeTargetShipment($input: String!) {
		likeTargetShipment(shipmentId: $input) {
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

export const CLAIM_SHIPMENT = gql`
	mutation ClaimShipment($input: String!) {
		claimShipment(shipmentId: $input) {
			_id
			shipmentStatus
			shipmentTrackingCode
			memberId
			carrierId
			updatedAt
		}
	}
`;

/**************************
 *     TRACKING-EVENT     *
 *************************/

export const CREATE_TRACKING_EVENT = gql`
	mutation CreateTrackingEvent($input: TrackingEventInput!) {
		createTrackingEvent(input: $input) {
			_id
			shipmentId
			memberId
			eventStatus
			eventLocation
			eventNote
			prevHash
			eventHash
			eventTxHash
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
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

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
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

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
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

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
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

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
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

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *       ASSISTANT       *
 *************************/

// input: { message, history: [{ role: 'user' | 'model', text }] } (last 6 messages)
export const ASK_ASSISTANT = gql`
	mutation AskAssistant($input: AssistantInput!) {
		askAssistant(input: $input) {
			reply
		}
	}
`;
