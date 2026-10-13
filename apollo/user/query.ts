import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_MEMBER = gql(`
query GetMember($input: String!) {
    getMember(memberId: $input) {
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
        memberArticles
        memberPoints
        memberLikes
        memberViews
        memberFollowings
				memberFollowers
        memberRank
        memberWarnings
        memberBlocks
        deletedAt
        createdAt
        updatedAt
        accessToken
        meFollowed {
					followingId
					followerId
					myFollowing
				}
    }
}
`);

/**************************
 *        CARRIER         *
 *************************/

export const GET_CARRIERS = gql`
	query GetCarriers($input: CarriersInquiry!) {
		getCarriers(input: $input) {
			list {
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
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        SHIPMENT        *
 *************************/

export const GET_SHIPMENT = gql`
	query GetShipment($input: String!) {
		getShipment(shipmentId: $input) {
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
			shipmentComments
			shipmentRank
			shipmentImages
			shipmentDesc
			memberId
			carrierId
			lastEventHash
			deliveredAt
			deletedAt
			createdAt
			updatedAt
			memberData {
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
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_SHIPMENT_BY_TRACKING_CODE = gql`
	query GetShipmentByTrackingCode($input: String!) {
		getShipmentByTrackingCode(trackingCode: $input) {
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
			shipmentComments
			shipmentRank
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

export const GET_SHIPMENTS = gql`
	query GetShipments($input: ShipmentsInquiry!) {
		getShipments(input: $input) {
			list {
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
				shipmentComments
				shipmentRank
				shipmentImages
				shipmentDesc
				memberId
				carrierId
				lastEventHash
				deliveredAt
				deletedAt
				createdAt
				updatedAt
				memberData {
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
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MY_SHIPMENTS = gql`
	query GetMyShipments($input: MyShipmentsInquiry!) {
		getMyShipments(input: $input) {
			list {
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
				shipmentComments
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
			metaCounter {
				total
			}
		}
	}
`;

export const GET_CARRIER_SHIPMENTS = gql`
	query GetCarrierShipments($input: MyShipmentsInquiry!) {
		getCarrierShipments(input: $input) {
			list {
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
				shipmentComments
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
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
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
				shipmentComments
				shipmentRank
				shipmentImages
				shipmentDesc
				memberId
				carrierId
				deliveredAt
				deletedAt
				createdAt
				updatedAt
				memberData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
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
				shipmentComments
				shipmentRank
				shipmentImages
				shipmentDesc
				memberId
				carrierId
				deliveredAt
				deletedAt
				createdAt
				updatedAt
				memberData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *     TRACKING-EVENT     *
 *************************/

export const GET_TRACKING_EVENTS = gql`
	query GetTrackingEvents($input: String!) {
		getTrackingEvents(shipmentId: $input) {
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

export const VERIFY_SHIPMENT_CHAIN = gql`
	query VerifyShipmentChain($input: String!) {
		verifyShipmentChain(shipmentId: $input) {
			valid
			totalEvents
			brokenAtIndex
			lastEventHash
			anchoredEvents
		}
	}
`;

export const GET_EVENT_ANCHOR_STATUSES = gql`
	query GetEventAnchorStatuses($input: String!) {
		getEventAnchorStatuses(shipmentId: $input) {
			eventId
			eventHash
			eventTxHash
			anchored
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
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
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
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
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
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
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
