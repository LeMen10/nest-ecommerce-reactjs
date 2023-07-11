import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Purchase.module.scss';
import Image from '~/components/Image';

const cx = className.bind(styles);

function Purchase() {
    const navigate = useNavigate();
    const [orderDetails, setOrderDetails] = useState([]);
    const [checkCancelled, setCheckCancelled] = useState(false);
    const [orderDetailId, setOrderDetailId] = useState();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const type = urlParams.get('type');

    const [activeLink, setActiveLink] = useState('noted');

    const handleLinkClick = (type) => {
        setActiveLink(type);
    };

    useEffect(() => {
        setActiveLink(type);
    }, [type]);

    useEffect(() => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/user/purchase?type=${type}`)
            .then(function (res) {
                setOrderDetails(res.data.order_details);
            })
            .catch(function (error) {
                const err = error.response.data.message;
                if (err === 'Invalid access token') navigate('/login');
            });
    }, [navigate, type]);

    const renderPage = (id) => {
        switch (type) {
            case 'complete':
                return (
                    <button className={cx('btn')} style={{ border: '1px solid #e8e8e8' }}>
                        Mua lại
                    </button>
                );
            case 'noted':
                return (
                    <button
                        className={cx('btn')}
                        style={{ border: '1px solid #e8e8e8' }}
                        onClick={() => {
                            setCheckCancelled(true);
                            setOrderDetailId(id);
                        }}
                        data-target={id}
                    >
                        Hủy đơn hàng
                    </button>
                );
            case 'delivering':
                return (
                    <button className={cx('btn')} style={{ border: '1px solid #e8e8e8' }}>
                        Hủy đơn hàng
                    </button>
                );
            default:
                return;
        }
    };

    const handleCancelledOrder = () => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/user/order-cancel/${orderDetailId}`)
            .then(function (res) {
                setCheckCancelled(false);
                navigate('/user/purchase?type=cancelled');
            })
            .catch(function (error) {
                const err = error.response.data.message;
                if (err === 'Invalid access token') navigate('/login');
            });
    };

    return (
        <div className={cx('container')}>
            <div className={cx('mt-4', 'mb-4')}>
                <div className={cx('title-page')}>
                    <h3>Đơn mua</h3>
                </div>

                <div className={cx('cate-purchase')}>
                    <Link
                        to={'?type=noted'}
                        className={cx('item-link', { active: activeLink === 'noted' })}
                        onClick={() => handleLinkClick('noted')}
                    >
                        <span>Đã ghi nhận</span>
                    </Link>
                    <Link
                        to={'?type=cancelled'}
                        className={cx('item-link', { active: activeLink === 'cancelled' })}
                        onClick={() => handleLinkClick('cancelled')}
                    >
                        <span>Đã hủy</span>
                    </Link>
                    <Link
                        to={'?type=complete'}
                        className={cx('item-link', { active: activeLink === 'complete' })}
                        onClick={() => handleLinkClick('complete')}
                    >
                        <span>Hoàn thành</span>
                    </Link>
                </div>

                {orderDetails.length > 0 ? (
                    orderDetails.map((result) => (
                        <div key={result._id} className={cx('order-detail-wrap')}>
                            <div>
                                <div className={cx('order-detail')}>
                                    <div className={cx('order-state')}>
                                        <span>{result.status}</span>
                                    </div>
                                    <Link to={''}>
                                        <div>
                                            <span className={cx('product-detail')}>
                                                <div className={cx('product-detail-left')}>
                                                    <div className={cx('img-product')}>
                                                        <Image style={{ width: '100px' }} src={result.img} alt="" />
                                                    </div>
                                                    <div className={cx('title-product-wrap')}>
                                                        <span className={cx('title-product')}>{result.title}</span>
                                                        <span className={cx('quantity-product')}>
                                                            x{result.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={cx('price-total-wrap')}>
                                                    <span className={cx('price-product')}>{result.price_total}$</span>
                                                </div>
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                            <div className={cx('order-line')}></div>
                            <div className={cx('order-total')}>
                                <span>Thành tiền: </span>
                                <p> {result.price_total}$</p>
                            </div>
                            <div style={{ padding: '12px 24px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                                {renderPage(result._id)}
                            </div>
                        </div>
                    ))
                ) : (
                    <></>
                )}

                {checkCancelled && (
                    <div className={cx('modal')}>
                        <div className={cx('modal__overlay')}></div>
                        <div className={cx('modal__body')}>
                            <div className={cx('auth-form')}>
                                <div className={cx('auth-form__container')}>
                                    <div className={cx('auth-form__header')}>
                                        <h3 className={cx('auth-form__heading')}>Hủy đơn hàng</h3>
                                    </div>

                                    <div className={cx('auth-form__form')}>
                                        Bạn có chắc chắn muốn hủy đơn hàng này không ?
                                    </div>
                                    <div className={cx('auth-form__control')}>
                                        <button
                                            onClick={() => setCheckCancelled(false)}
                                            className={cx('btn auth-form__control-back', 'btn--normal')}
                                        >
                                            Trở lại
                                        </button>
                                        <button
                                            className={cx('btn', 'btn--primary', 'view-cart')}
                                            onClick={handleCancelledOrder}
                                        >
                                            Hủy đơn hàng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Purchase;
