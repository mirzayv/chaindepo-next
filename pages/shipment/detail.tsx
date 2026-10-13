/**
 * ============================================================================
 *  FRONTEND: pages/shipment/detail.tsx   →   URL: localhost:3000/shipment/detail?id=6512ab...
 *                                                 yoki /shipment/detail?code=CD261013A1B2C3D4
 *  Shipment Detail Screen (oldin: pages/property/detail.tsx, 141-DARS)
 * ============================================================================
 *
 *  BU SAHIFA NIMA?
 *  BITTA YUKNING sahifasi. Mijoz kartani bosdi yoki tracking code kiritdi → shu yerga keldi.
 *  Uch xil papka ochiladi:
 *    1) GET_SHIPMENT    → shu yukning hujjatlari (sarlavha, narx, rasmlar, yo'nalish, yuboruvchi)
 *    2) GET_SHIPMENTS   → shu shahardan chiqadigan boshqa yuklar ("Similar Shipments")
 *    3) GET_COMMENTS    → sharhlar
 *  Va ikkita harakat: like bosish (LIKE_TARGET_SHIPMENT), sharh yozish (CREATE_COMMENT).
 *
 *  OQIM:
 *  ?id=   → setShipmentId(id) → GET_SHIPMENT ketadi
 *  ?code= → GET_SHIPMENT_BY_TRACKING_CODE → _id topiladi → setShipmentId(_id) → GET_SHIPMENT ketadi
 *  shipment keldi → GET_SHIPMENTS (shu origin) ketadi
 */

import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import Review from '../../libs/components/shipment/Review';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import ShipmentBigCard from '../../libs/components/common/ShipmentBigCard';
import TrackingTimeline from '../../libs/components/shipment/TrackingTimeline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Shipment } from '../../libs/types/shipment/shipment';
import { Member } from '../../libs/types/member/member';
import moment from 'moment';
import { formatterStr } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
// REACT_APP_API_URL — backend manzili. Rasmlar shu manzildan olinadi: .../uploads/shipment/abc.jpg
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Pagination as MuiPagination } from '@mui/material';
// "as" — qayta nomlash: Swiper'ning Pagination'i bilan nomi to'qnashmasin.
import Link from 'next/link';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import 'swiper/css';
import 'swiper/css/pagination';
import {
	GET_COMMENTS,
	GET_MEMBER,
	GET_SHIPMENT,
	GET_SHIPMENT_BY_TRACKING_CODE,
	GET_SHIPMENTS,
} from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { CREATE_COMMENT, LIKE_TARGET_SHIPMENT } from '../../apollo/user/mutation';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});
// Faqat tarjimalar (SSG). Yuk ma'lumoti brauzerda keladi (CSR).

const ShipmentDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [shipmentId, setShipmentId] = useState<string | null>(null);
	const [trackingCode, setTrackingCode] = useState<string | null>(null);
	const [shipment, setShipment] = useState<Shipment | null>(null);
	const [carrier, setCarrier] = useState<Member | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [similarShipments, setSimilarShipments] = useState<Shipment[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [shipmentComments, setShipmentComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.SHIPMENT,
		commentContent: '',
		commentRefId: '',
	});
	// commentGroup: SHIPMENT — bu sharh YUKKA yozilyapti (maqolaga yoki a'zoga emas).

	const similarInput = {
		page: 1,
		limit: 4,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			originList: shipment?.shipmentOrigin ? [shipment?.shipmentOrigin] : [],
		},
	};

	/** APOLLO REQUESTS **/

	const [likeTargetShipment] = useMutation(LIKE_TARGET_SHIPMENT);
	const [createComment] = useMutation(CREATE_COMMENT);

	// ── 0-PAPKA: ?code= bo'lsa, tracking code bo'yicha _id topiladi ──
	useQuery(GET_SHIPMENT_BY_TRACKING_CODE, {
		fetchPolicy: 'network-only',
		variables: { input: trackingCode },
		skip: !trackingCode,
		onCompleted: (data: T) => {
			if (data?.getShipmentByTrackingCode?._id) setShipmentId(data.getShipmentByTrackingCode._id);
		},
		onError: (err) => {
			sweetMixinErrorAlert(err.message).then();
		},
	});

	// ── 1-PAPKA: SHU YUKNING HUJJATLARI ──
	const {
		loading: getShipmentLoading,
		data: getShipmentData,
		error: getShipmentError,
		refetch: getShipmentRefetch,
	} = useQuery(GET_SHIPMENT, {
		fetchPolicy: 'network-only',
		// HAR DOIM SERVERGA BOR: backend getShipment har chaqirilganda recordView → shipmentViews +1 va meLiked tekshiradi.
		variables: { input: shipmentId },
		skip: !shipmentId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getShipment) setShipment(data?.getShipment);
			if (data?.getShipment) setSlideImage(data?.getShipment?.shipmentImages[0]);
		},
	});

	// ── Tashuvchi (agar biriktirilgan bo'lsa) ──
	useQuery(GET_MEMBER, {
		fetchPolicy: 'cache-and-network',
		variables: { input: shipment?.carrierId },
		skip: !shipment?.carrierId,
		onCompleted: (data: T) => {
			if (data?.getMember) setCarrier(data.getMember);
		},
	});

	// ── 2-PAPKA: SHU SHAHARDAN CHIQADIGAN BOSHQA YUKLAR ──
	const {
		loading: getShipmentsLoading,
		data: getShipmentsData,
		error: getShipmentsError,
		refetch: getShipmentsRefetch,
	} = useQuery(GET_SHIPMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: similarInput },
		skip: !shipmentId || !shipment,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getShipments?.list)
				setSimilarShipments(data.getShipments.list.filter((item: Shipment) => item._id !== shipmentId));
		},
	});

	// ── 3-PAPKA: SHARHLAR ──
	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialComment },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setShipmentComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) setShipmentId(router.query.id as string);
		else if (router.query.code) setTrackingCode(router.query.code as string);
	}, [router]);

	useEffect(() => {
		// shipmentId aniq bo'lgach (id yoki code orqali) sharhlar cheki va forma shu yukka bog'lanadi.
		if (!shipmentId) return;
		setCommentInquiry({ ...commentInquiry, search: { commentRefId: shipmentId } });
		setInsertCommentData({ ...insertCommentData, commentRefId: shipmentId });
	}, [shipmentId]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const likeShipmentHandler = async (user: T, id: string) => {
		// Bu handler IKKI joyda ishlatiladi: 1) asosiy yukning yurakchasi, 2) pastdagi ShipmentBigCard'lar.
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetShipment({ variables: { input: id } });
			await getShipmentRefetch({ input: shipmentId });
			await getShipmentsRefetch({ input: similarInput });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeShipmentHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry({ ...commentInquiry, page: value });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });
			// Backend: createComment → shipmentComments +1.

			setInsertCommentData({ ...insertCommentData, commentContent: '' });
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (device === 'mobile') {
		return <div>SHIPMENT DETAIL PAGE</div>;
	} else {
		return (
			<div id={'property-detail-page'}>
				<div className={'container'}>
					<Stack className={'property-detail-config'}>
						<Stack className={'property-info-config'}>
							<Stack className={'info'}>
								<Stack className={'left-box'}>
									<Typography className={'title-main'}>{shipment?.shipmentTitle}</Typography>
									<Stack className={'top-box'}>
										<Typography className={'city'}>
											{shipment?.shipmentOrigin} → {shipment?.shipmentDestination}
										</Typography>
										<Stack className={'divider'}></Stack>
										<Stack className={'buy-rent-box'}>
											<Stack className={'circle'}>
												<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
													<circle cx="3" cy="3" r="3" fill="#EB6753" />
												</svg>
											</Stack>
											<Typography className={'buy-rent'}>{shipment?.shipmentStatus}</Typography>
										</Stack>
										<Stack className={'divider'}></Stack>
										<Typography className={'date'}>{moment().diff(shipment?.createdAt, 'days')} days ago</Typography>
									</Stack>
									<Stack className={'bottom-box'}>
										<Stack className="option">
											<Typography>{shipment?.shipmentTrackingCode}</Typography>
										</Stack>
										<Stack className="option">
											<img src="/img/icons/expand.svg" alt="" /> <Typography>{shipment?.shipmentWeight} kg</Typography>
										</Stack>
										<Stack className="option">
											<Typography>{shipment?.shipmentType}</Typography>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'right-box'}>
									<Stack className="buttons">
										<Stack className="button-box">
											<RemoveRedEyeIcon fontSize="medium" />
											<Typography>{shipment?.shipmentViews}</Typography>
										</Stack>
										<Stack className="button-box">
											{shipment?.meLiked && shipment?.meLiked[0]?.myFavorite ? (
												<FavoriteIcon
													color="primary"
													fontSize={'medium'}
													onClick={() => likeShipmentHandler(user, shipment?._id as string)}
												/>
											) : (
												<FavoriteBorderIcon
													fontSize={'medium'}
													onClick={() => likeShipmentHandler(user, shipment?._id as string)}
												/>
											)}
											<Typography>{shipment?.shipmentLikes}</Typography>
										</Stack>
									</Stack>
									<Typography>${formatterStr(shipment?.shipmentPrice)}</Typography>
								</Stack>
							</Stack>
							<Stack className={'images'}>
								<Stack className={'main-image'}>
									<img
										src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/property/bigImage.png'}
										alt={'main-image'}
									/>
								</Stack>
								<Stack className={'sub-images'}>
									{shipment?.shipmentImages.map((subImg: string) => {
										const imagePath: string = `${REACT_APP_API_URL}/${subImg}`;
										return (
											<Stack className={'sub-img-box'} onClick={() => changeImageHandler(subImg)} key={subImg}>
												<img src={imagePath} alt={'sub-image'} />
											</Stack>
										);
									})}
								</Stack>
							</Stack>
						</Stack>
						<Stack className={'property-desc-config'}>
							<Stack className={'left-config'}>
								<Stack className={'options-config'}>
									<Stack className={'option'}>
										<Stack className={'svg-box'}>
											<img src={'/img/icons/room.svg'} />
										</Stack>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Route</Typography>
											<Typography className={'option-data'}>
												{shipment?.shipmentOrigin} → {shipment?.shipmentDestination}
											</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'svg-box'}>
											<img src={'/img/icons/expand.svg'} />
										</Stack>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Weight</Typography>
											<Typography className={'option-data'}>{shipment?.shipmentWeight} kg</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Created</Typography>
											<Typography className={'option-data'}>
												{shipment?.createdAt ? moment(shipment.createdAt).format('YYYY.MM.DD') : '-'}
											</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Shipment Type</Typography>
											<Typography className={'option-data'}>{shipment?.shipmentType}</Typography>
										</Stack>
									</Stack>
									<Stack className={'option'}>
										<Stack className={'option-includes'}>
											<Typography className={'title'}>Status</Typography>
											<Typography className={'option-data'}>{shipment?.shipmentStatus}</Typography>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'prop-desc-config'}>
									<Stack className={'top'}>
										<Typography className={'title'}>Shipment Description</Typography>
										<Typography className={'desc'}>{shipment?.shipmentDesc ?? 'No Description!'}</Typography>
									</Stack>
									<Stack className={'bottom'}>
										<Typography className={'title'}>Shipment Details</Typography>
										<Stack className={'info-box'}>
											<Stack className={'left'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Tracking Code</Typography>
													<Typography className={'data'}>{shipment?.shipmentTrackingCode}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Price</Typography>
													<Typography className={'data'}>${formatterStr(shipment?.shipmentPrice)}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Weight</Typography>
													<Typography className={'data'}>{shipment?.shipmentWeight} kg</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Pickup Address</Typography>
													<Typography className={'data'}>{shipment?.shipmentAddress}</Typography>
												</Box>
											</Stack>
											<Stack className={'right'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Origin</Typography>
													<Typography className={'data'}>{shipment?.shipmentOrigin}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Destination</Typography>
													<Typography className={'data'}>{shipment?.shipmentDestination}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Carrier</Typography>
													<Typography className={'data'}>
														{shipment?.carrierId ? (
															<Link href={`/carrier/detail?carrierId=${shipment.carrierId}`}>
																{carrier?.memberNick ?? 'Assigned'}
															</Link>
														) : (
															'Not assigned'
														)}
													</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Delivered At</Typography>
													<Typography className={'data'}>
														{shipment?.deliveredAt ? moment(shipment.deliveredAt).format('YYYY.MM.DD HH:mm') : '-'}
													</Typography>
												</Box>
											</Stack>
										</Stack>
									</Stack>
								</Stack>
								{/* TRACKING: hash-chain hodisalari + Sepolia anchoring holati. */}
								<TrackingTimeline shipmentId={shipmentId} refreshKey={shipment?.lastEventHash} />
								{/* SHARHLAR: faqat kamida bitta sharh bo'lsa ko'rinadi. */}
								{commentTotal !== 0 && (
									<Stack className={'reviews-config'}>
										<Stack className={'filter-box'}>
											<Stack className={'review-cnt'}>
												<Typography className={'reviews'}>{commentTotal} reviews</Typography>
											</Stack>
										</Stack>
										<Stack className={'review-list'}>
											{shipmentComments?.map((comment: Comment) => {
												return <Review comment={comment} key={comment?._id} />;
											})}
											<Box component={'div'} className={'pagination-box'}>
												<MuiPagination
													page={commentInquiry.page}
													count={Math.ceil(commentTotal / commentInquiry.limit)}
													onChange={commentPaginationChangeHandler}
													shape="circular"
													color="primary"
												/>
											</Box>
										</Stack>
									</Stack>
								)}
								<Stack className={'leave-review-config'}>
									<Typography className={'main-title'}>Leave A Review</Typography>
									<Typography className={'review-title'}>Review</Typography>
									<textarea
										onChange={({ target: { value } }: any) => {
											setInsertCommentData({ ...insertCommentData, commentContent: value });
										}}
										value={insertCommentData.commentContent}
									></textarea>
									<Box className={'submit-btn'} component={'div'}>
										<Button
											className={'submit-review'}
											disabled={insertCommentData.commentContent === '' || user?._id === ''}
											onClick={createCommentHandler}
										>
											<Typography className={'title'}>Submit Review</Typography>
											<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
												<g clipPath="url(#clip0_6975_3642)">
													<path
														d="M16.1571 0.5H6.37936C6.1337 0.5 5.93491 0.698792 5.93491 0.944458C5.93491 1.19012 6.1337 1.38892 6.37936 1.38892H15.0842L0.731781 15.7413C0.558156 15.915 0.558156 16.1962 0.731781 16.3698C0.818573 16.4566 0.932323 16.5 1.04603 16.5C1.15974 16.5 1.27345 16.4566 1.36028 16.3698L15.7127 2.01737V10.7222C15.7127 10.9679 15.9115 11.1667 16.1572 11.1667C16.4028 11.1667 16.6016 10.9679 16.6016 10.7222V0.944458C16.6016 0.698792 16.4028 0.5 16.1571 0.5Z"
														fill="#181A20"
													/>
												</g>
												<defs>
													<clipPath id="clip0_6975_3642">
														<rect width="16" height="16" fill="white" transform="translate(0.601562 0.5)" />
													</clipPath>
												</defs>
											</svg>
										</Button>
									</Box>
								</Stack>
							</Stack>
							<Stack className={'right-config'}>
								<Stack className={'info-box'}>
									<Typography className={'main-title'}>Shipper</Typography>
									<Stack className={'image-info'}>
										<img
											className={'member-image'}
											src={
												shipment?.memberData?.memberImage
													? `${REACT_APP_API_URL}/${shipment?.memberData?.memberImage}`
													: '/img/profile/defaultUser.svg'
											}
										/>
										<Stack className={'name-phone-listings'}>
											<Link href={`/member?memberId=${shipment?.memberData?._id}`}>
												<Typography className={'name'}>{shipment?.memberData?.memberNick}</Typography>
											</Link>
											<Stack className={'phone-number'}>
												<img src="/img/icons/call.svg" alt="" />
												<Typography className={'number'}>{shipment?.memberData?.memberPhone}</Typography>
											</Stack>
											<Link href={`/member?memberId=${shipment?.memberData?._id}&category=shipments`}>
												<Typography className={'listings'}>View Shipments</Typography>
											</Link>
										</Stack>
									</Stack>
								</Stack>
								<Stack className={'info-box'}>
									<Typography className={'sub-title'}>Name</Typography>
									<input type={'text'} placeholder={'Enter your name'} />
								</Stack>
								<Stack className={'info-box'}>
									<Typography className={'sub-title'}>Phone</Typography>
									<input type={'text'} placeholder={'Enter your phone'} />
								</Stack>
								<Stack className={'info-box'}>
									<Typography className={'sub-title'}>Message</Typography>
									<textarea
										placeholder={`Hello, I have a question about shipment ${shipment?.shipmentTrackingCode ?? ''}`}
									></textarea>
								</Stack>
								<Stack className={'info-box'}>
									<Button className={'send-message'}>
										<Typography className={'title'}>Send Message</Typography>
									</Button>
								</Stack>
							</Stack>
						</Stack>
						{/* "SIMILAR SHIPMENTS": shu shahardan chiqadigan boshqa yuklar (2-papka). */}
						{similarShipments.length !== 0 && (
							<Stack className={'similar-properties-config'}>
								<Stack className={'title-pagination-box'}>
									<Stack className={'title-box'}>
										<Typography className={'main-title'}>Similar Shipments</Typography>
										<Typography className={'sub-title'}>Other shipments leaving {shipment?.shipmentOrigin}</Typography>
									</Stack>
									<Stack className={'pagination-box'}>
										<WestIcon className={'swiper-similar-prev'} />
										<div className={'swiper-similar-pagination'}></div>
										<EastIcon className={'swiper-similar-next'} />
									</Stack>
								</Stack>
								<Stack className={'cards-box'}>
									<Swiper
										className={'similar-homes-swiper'}
										slidesPerView={'auto'}
										spaceBetween={35}
										modules={[Autoplay, Navigation, Pagination]}
										navigation={{
											nextEl: '.swiper-similar-next',
											prevEl: '.swiper-similar-prev',
										}}
										pagination={{
											el: '.swiper-similar-pagination',
										}}
									>
										{similarShipments.map((item: Shipment) => {
											return (
												<SwiperSlide className={'similar-homes-slide'} key={item._id}>
													<ShipmentBigCard shipment={item} likeShipmentHandler={likeShipmentHandler} key={item?._id} />
												</SwiperSlide>
											);
										})}
									</Swiper>
								</Stack>
							</Stack>
						)}
					</Stack>
				</div>
			</div>
		);
	}
};

ShipmentDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutFull(ShipmentDetail);
